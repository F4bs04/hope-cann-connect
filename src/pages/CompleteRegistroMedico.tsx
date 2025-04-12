
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Info, Upload, Camera, User, Clock, Plus, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  crm: z.string().min(4, {
    message: 'CRM inválido',
  }).max(14),
  telefone: z.string().min(10, {
    message: 'Telefone inválido',
  }).max(15),
  especialidade: z.string().min(3, {
    message: 'Especialidade é obrigatória',
  }),
  biografia: z.string().optional(),
  certificado: z.instanceof(File, {
    message: 'Certificado obrigatório',
  }).optional(),
  foto: z.instanceof(File, {
    message: 'Foto de perfil',
  }).optional(),
  termoConciencia: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos',
  }),
});

interface DiaHorario {
  dia: string;
  horaInicio: string;
  horaFim: string;
}

type FormValues = z.infer<typeof formSchema>;

const diasSemana = [
  { value: "segunda", label: "Segunda-feira" },
  { value: "terca", label: "Terça-feira" },
  { value: "quarta", label: "Quarta-feira" },
  { value: "quinta", label: "Quinta-feira" },
  { value: "sexta", label: "Sexta-feira" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

const CompleteRegistroMedico = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [termoDialogOpen, setTermoDialogOpen] = useState(false);
  const [certificadoNome, setCertificadoNome] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [horarios, setHorarios] = useState<DiaHorario[]>([]);
  const [diaAtual, setDiaAtual] = useState<string>("");
  const [horaInicio, setHoraInicio] = useState<string>("");
  const [horaFim, setHoraFim] = useState<string>("");
  const [userInfo, setUserInfo] = useState<{name?: string, email?: string, photoUrl?: string, userId?: string} | null>(null);
  const [medicoId, setMedicoId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Sua sessão expirou ou você não está autenticado. Redirecionando para a página de login.",
        });
        navigate('/cadastro-medico');
        return;
      }
      
      const user = session.user;
      if (user) {
        // Get user info from auth
        setUserInfo({
          name: user.user_metadata?.full_name,
          email: user.email,
          photoUrl: user.user_metadata?.avatar_url,
          userId: user.id
        });
        
        if (user.user_metadata?.avatar_url) {
          setFotoPreview(user.user_metadata.avatar_url);
        }

        // Get user ID from our usuarios table
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
          return;
        }

        // Get medico data if exists
        if (userData) {
          const { data: medicoData, error: medicoError } = await supabase
            .from('medicos')
            .select('*')
            .eq('id_usuario', userData.id)
            .single();

          if (!medicoError && medicoData) {
            setMedicoId(medicoData.id.toString());
            
            // Pre-fill form with existing data
            form.setValue('crm', medicoData.crm || '');
            form.setValue('telefone', medicoData.telefone || '');
            form.setValue('especialidade', medicoData.especialidade || '');
            form.setValue('biografia', medicoData.biografia || '');
            
            if (medicoData.foto_perfil) {
              setFotoPreview(medicoData.foto_perfil);
            }
          }
        }
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crm: '',
      telefone: '',
      especialidade: '',
      biografia: '',
      termoConciencia: false,
    },
  });

  const addHorario = () => {
    if (!diaAtual || !horaInicio || !horaFim) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Preencha todos os campos do horário",
      });
      return;
    }

    // Check if time is valid
    if (horaInicio >= horaFim) {
      toast({
        variant: "destructive",
        title: "Horário inválido",
        description: "A hora de início deve ser antes da hora de fim",
      });
      return;
    }

    // Check if overlapping with existing hours for the same day
    const overlapping = horarios.some(h => 
      h.dia === diaAtual && 
      ((horaInicio >= h.horaInicio && horaInicio < h.horaFim) || 
       (horaFim > h.horaInicio && horaFim <= h.horaFim) ||
       (horaInicio <= h.horaInicio && horaFim >= h.horaFim))
    );

    if (overlapping) {
      toast({
        variant: "destructive",
        title: "Horário sobreposto",
        description: "Este horário se sobrepõe a outro já adicionado no mesmo dia",
      });
      return;
    }

    setHorarios([...horarios, { dia: diaAtual, horaInicio, horaFim }]);
    setDiaAtual("");
    setHoraInicio("");
    setHoraFim("");
  };

  const removeHorario = (index: number) => {
    const newHorarios = [...horarios];
    newHorarios.splice(index, 1);
    setHorarios(newHorarios);
  };

  const onSubmit = async (data: FormValues) => {
    console.log('Dados complementares:', data);
    setIsLoading(true);
    
    if (horarios.length === 0) {
      toast({
        variant: "destructive",
        title: "Horários não definidos",
        description: "Você precisa adicionar pelo menos um horário de atendimento",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      if (!userInfo?.email) {
        throw new Error("Informações de usuário não encontradas");
      }
      
      // Get user ID from usuarios table
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', userInfo.email)
        .single();
      
      if (userError) {
        throw userError;
      }
      
      // Upload profile photo if provided
      let fotoUrl = fotoPreview;
      if (data.foto) {
        const fileExt = data.foto.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `medicos/${fileName}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('profiles')
          .upload(filePath, data.foto);
          
        if (uploadError) {
          console.error("Error uploading photo:", uploadError);
          throw new Error("Erro ao fazer upload da foto");
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);
          
        fotoUrl = publicUrl;
      }
      
      // Update or create medico record
      let medicoIdToUse = medicoId;
      
      if (!medicoId) {
        // Create new record if doesn't exist
        const { data: newMedico, error: createError } = await supabase
          .from('medicos')
          .insert([
            {
              id_usuario: userData.id,
              nome: userInfo.name || '',
              crm: data.crm,
              especialidade: data.especialidade,
              biografia: data.biografia || null,
              telefone: data.telefone,
              foto_perfil: fotoUrl,
              status_disponibilidade: true // Now active
            }
          ])
          .select('id')
          .single();
          
        if (createError) {
          throw createError;
        }
        
        medicoIdToUse = newMedico.id.toString();
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from('medicos')
          .update({
            crm: data.crm,
            especialidade: data.especialidade,
            biografia: data.biografia || null,
            telefone: data.telefone,
            foto_perfil: fotoUrl,
            status_disponibilidade: true // Now active
          })
          .eq('id', medicoId);
          
        if (updateError) {
          throw updateError;
        }
      }
      
      // Save schedule information
      for (const horario of horarios) {
        const { error: horarioError } = await supabase
          .from('horarios_disponiveis')
          .insert([{
            id_medico: medicoIdToUse,
            dia_semana: horario.dia,
            hora_inicio: horario.horaInicio,
            hora_fim: horario.horaFim
          }]);
          
        if (horarioError) {
          console.error("Error saving schedule:", horarioError);
          throw horarioError;
        }
      }
      
      // Update usuario status to active
      const { error: statusError } = await supabase
        .from('usuarios')
        .update({
          status: true
        })
        .eq('id', userData.id);
        
      if (statusError) {
        throw statusError;
      }
      
      toast({
        title: "Cadastro concluído com sucesso!",
        description: "Você já pode começar a atender pacientes na plataforma.",
      });
      
      // Redirect to doctor dashboard
      navigate('/area-medico');
      
    } catch (error: any) {
      console.error("Erro ao enviar dados complementares:", error);
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'certificado' | 'foto') => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (type === 'certificado') {
        if (file.name.endsWith('.pfx')) {
          form.setValue('certificado', file);
          setCertificadoNome(file.name);
        } else {
          toast({
            variant: "destructive",
            title: "Arquivo inválido",
            description: "Apenas certificados PFX são aceitos",
          });
        }
      } else if (type === 'foto') {
        if (file.type.startsWith('image/')) {
          form.setValue('foto', file);
          setFotoPreview(URL.createObjectURL(file));
        } else {
          toast({
            variant: "destructive",
            title: "Arquivo inválido",
            description: "Apenas imagens são aceitas",
          });
        }
      }
    }
  };

  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatTelefone(e.target.value);
    form.setValue('telefone', formattedValue);
  };

  const formatCRM = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{6})(\d)/, '$1/$2');
  };

  const handleCRMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCRM(e.target.value);
    form.setValue('crm', formattedValue);
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hopecann-teal"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="hopecann-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-hopecann-green mb-4">Complete seu cadastro</h1>
              <p className="text-gray-600">
                Precisamos de algumas informações adicionais para concluir seu cadastro como médico
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-8">
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
                    {userInfo.photoUrl ? (
                      <img 
                        src={userInfo.photoUrl} 
                        alt={userInfo.name || "Foto de perfil"} 
                        className="w-20 h-20 rounded-full object-cover mb-3" 
                      />
                    ) : (
                      <User className="w-20 h-20 p-4 bg-gray-200 text-gray-500 rounded-full mb-3" />
                    )}
                    <h3 className="font-medium text-lg">{userInfo.name}</h3>
                    <p className="text-gray-500">{userInfo.email}</p>
                  </div>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Foto de perfil (opcional se já tiver do Google) */}
                    {!userInfo.photoUrl && (
                      <FormField
                        control={form.control}
                        name="foto"
                        render={({ field }) => (
                          <FormItem className="flex flex-col items-center">
                            <FormLabel className="w-full text-left">Foto de perfil</FormLabel>
                            <FormControl>
                              <div className="flex flex-col items-center">
                                <div 
                                  className="w-32 h-32 rounded-full border-2 border-dashed border-hopecann-teal/50 flex items-center justify-center overflow-hidden mb-2 relative hover:border-hopecann-teal cursor-pointer"
                                  onClick={() => document.getElementById('foto-perfil')?.click()}
                                >
                                  {fotoPreview ? (
                                    <img 
                                      src={fotoPreview} 
                                      alt="Preview" 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="h-16 w-16 text-gray-400" />
                                  )}
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <Camera className="h-8 w-8 text-white" />
                                  </div>
                                </div>
                                <input
                                  id="foto-perfil"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileChange(e, 'foto')}
                                />
                                <span className="text-sm text-gray-500">Clique para enviar uma foto</span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="crm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CRM</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="000000/UF" 
                                {...field} 
                                onChange={(e) => {
                                  handleCRMChange(e);
                                  field.onChange(e);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="telefone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone de contato</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="(00) 00000-0000" 
                                {...field} 
                                onChange={(e) => {
                                  handleTelefoneChange(e);
                                  field.onChange(e);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="especialidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidade</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Neurologia, Psiquiatria, etc." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="biografia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biografia Profissional</FormLabel>
                          <FormControl>
                            <textarea 
                              className="w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-hopecann-teal/40" 
                              placeholder="Descreva sua experiência profissional e formação"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Esta informação será exibida em seu perfil público.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="border rounded-md p-4">
                      <h3 className="font-medium text-lg mb-4">Horários de atendimento</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Dia da semana</label>
                          <Select value={diaAtual} onValueChange={setDiaAtual}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o dia" />
                            </SelectTrigger>
                            <SelectContent>
                              {diasSemana.map((dia) => (
                                <SelectItem key={dia.value} value={dia.value}>
                                  {dia.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Hora de início</label>
                          <Input 
                            type="time" 
                            value={horaInicio} 
                            onChange={(e) => setHoraInicio(e.target.value)} 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Hora de término</label>
                          <Input 
                            type="time" 
                            value={horaFim} 
                            onChange={(e) => setHoraFim(e.target.value)} 
                          />
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={addHorario}
                      >
                        <Plus size={16} />
                        Adicionar horário
                      </Button>
                      
                      {horarios.length > 0 && (
                        <div className="mt-4 border rounded-md p-2">
                          <h4 className="font-medium mb-2">Horários adicionados:</h4>
                          <ul className="space-y-2">
                            {horarios.map((horario, index) => {
                              const diaLabel = diasSemana.find(d => d.value === horario.dia)?.label;
                              return (
                                <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                  <span>
                                    {diaLabel} - {horario.horaInicio} até {horario.horaFim}
                                  </span>
                                  <button
                                    type="button"
                                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                                    onClick={() => removeHorario(index)}
                                  >
                                    <X size={16} />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                      
                      {horarios.length === 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          Adicione pelo menos um horário de atendimento.
                        </p>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="certificado"
                      render={() => (
                        <FormItem>
                          <FormLabel>Certificado Digital PFX A1</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-3">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => document.getElementById('certificado')?.click()}
                                className="w-full py-8 border-dashed border-2 flex flex-col items-center justify-center gap-2"
                              >
                                <Upload className="h-6 w-6 text-hopecann-green" />
                                <span>{certificadoNome || "Clique para enviar certificado"}</span>
                                <span className="text-xs text-gray-500">Apenas arquivos .pfx</span>
                                <input
                                  id="certificado"
                                  type="file"
                                  accept=".pfx"
                                  className="hidden"
                                  onChange={(e) => handleFileChange(e, 'certificado')}
                                />
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            <div className="flex items-start gap-2 text-sm mt-2">
                              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>Este certificado é necessário para a assinatura digital de receitas e prontuários.</span>
                            </div>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="termoConciencia"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Estou ciente das responsabilidades médicas relacionadas à prescrição de produtos à base de cannabis
                            </FormLabel>
                            <FormDescription>
                              <button 
                                type="button"
                                className="text-hopecann-teal hover:underline"
                                onClick={() => setTermoDialogOpen(true)}
                              >
                                Ler termo completo
                              </button>
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-hopecann-green hover:bg-hopecann-green/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Processando...
                        </span>
                      ) : "Concluir Cadastro"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={termoDialogOpen} onOpenChange={setTermoDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termo de Consciência e Responsabilidade</DialogTitle>
            <DialogDescription>
              Leia com atenção os termos abaixo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p>Os produtos à base de cannabis medicinal são regulamentados pela Anvisa (Agência Nacional de Vigilância Sanitária) por meio da Resolução da Diretoria Colegiada (RDC) n° 327/2019, que estabelece os procedimentos para a concessão da Autorização Sanitária e para o registro de produtos derivados de cannabis.</p>
            
            <p>Como médico prescritor, declaro estar ciente que:</p>
            
            <ol className="list-decimal pl-5 space-y-2">
              <li>A prescrição de produtos à base de cannabis deve seguir as diretrizes da RDC 327/2019, exigindo registro no Conselho Federal de Medicina e retenção de receita.</li>
              <li>Sou responsável pelo acompanhamento do paciente, monitoramento de efeitos colaterais e reações adversas.</li>
              <li>Devo informar adequadamente o paciente sobre riscos, benefícios e alternativas terapêuticas.</li>
              <li>A prescrição deve ser baseada em evidências científicas e na resposta individual do paciente ao tratamento.</li>
              <li>Reconheço que há limitações nos estudos sobre eficácia e segurança em longo prazo de alguns produtos canábicos.</li>
              <li>Devo estar atualizado sobre as pesquisas e regulamentações referentes à cannabis medicinal.</li>
              <li>Entendo que a prescrição deve ser feita em receituário do tipo B (azul), com identificação do prescritor e do paciente.</li>
            </ol>
            
            <p className="font-semibold">Ao concordar com este termo, assumo total responsabilidade pela prescrição de produtos à base de cannabis, reconhecendo os aspectos éticos, legais e profissionais envolvidos.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompleteRegistroMedico;
