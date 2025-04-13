import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
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
import { supabase } from "@/integrations/supabase/client";

// Import custom components
import HorariosAtendimento, { diasSemana } from '@/components/medico/cadastro/HorariosAtendimento';
import TermosResponsabilidade from '@/components/medico/cadastro/TermosResponsabilidade';
import UploadCertificado from '@/components/medico/cadastro/UploadCertificado';
import FotoPerfil from '@/components/medico/cadastro/FotoPerfil';
import UserInfoCard from '@/components/medico/cadastro/UserInfoCard';

// Import schemas and utils
import { cadastroMedicoFormSchema, type CadastroMedicoFormValues } from '@/schemas/cadastroMedicoSchema';
import { formatTelefone, formatCRM } from '@/utils/formatters';

// Types
interface DiaHorario {
  dia: string;
  horaInicio: string;
  horaFim: string;
}

const CompleteRegistroMedico = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [termoDialogOpen, setTermoDialogOpen] = useState(false);
  const [certificadoNome, setCertificadoNome] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [horarios, setHorarios] = useState<DiaHorario[]>([]);
  const [userInfo, setUserInfo] = useState<{name?: string, email?: string, photoUrl?: string, userId?: string} | null>(null);
  const [medicoId, setMedicoId] = useState<string | null>(null);

  const form = useForm<CadastroMedicoFormValues>({
    resolver: zodResolver(cadastroMedicoFormSchema),
    defaultValues: {
      crm: '',
      telefone: '',
      especialidade: '',
      biografia: '',
      termoConciencia: false,
    },
  });

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
  }, [navigate, toast, form]);

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

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatTelefone(e.target.value);
    form.setValue('telefone', formattedValue);
  };

  const handleCRMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCRM(e.target.value);
    form.setValue('crm', formattedValue);
  };

  const onSubmit = async (data: CadastroMedicoFormValues) => {
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
          .insert({
            id_usuario: userData.id,
            nome: userInfo.name || '',
            crm: data.crm,
            cpf: '', // Required field in the database
            especialidade: data.especialidade,
            biografia: data.biografia || null,
            telefone: data.telefone,
            foto_perfil: fotoUrl,
            status_disponibilidade: true // Now active
          })
          .select()
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
          .eq('id', parseInt(medicoId));
          
        if (updateError) {
          throw updateError;
        }
      }
      
      // Save schedule information
      for (const horario of horarios) {
        // Use raw query to insert into the horarios_disponiveis table
        const { error: horariosError } = await supabase
          .from('horarios_disponiveis')
          .insert({
            id_medico: medicoIdToUse ? parseInt(medicoIdToUse) : null,
            dia_semana: horario.dia,
            hora_inicio: horario.horaInicio,
            hora_fim: horario.horaFim
          });
          
        if (horariosError) {
          console.error("Error saving schedule:", horariosError);
          throw horariosError;
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
                <UserInfoCard userInfo={userInfo} />
                
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Foto de perfil (opcional se já tiver do Google) */}
                    {!userInfo.photoUrl && (
                      <FotoPerfil 
                        fotoPreview={fotoPreview} 
                        handleFileChange={handleFileChange}
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

                    <HorariosAtendimento horarios={horarios} setHorarios={setHorarios} />

                    <UploadCertificado 
                      certificadoNome={certificadoNome}
                      setCertificadoNome={setCertificadoNome} 
                      handleFileChange={handleFileChange}
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
                </FormProvider>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      <TermosResponsabilidade 
        open={termoDialogOpen} 
        onOpenChange={setTermoDialogOpen} 
      />
    </div>
  );
};

export default CompleteRegistroMedico;
