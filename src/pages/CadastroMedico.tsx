
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Info, Check, Upload, Calendar, Camera, User, Mail } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  nome: z.string().min(3, {
    message: 'O nome deve ter pelo menos 3 caracteres',
  }),
  email: z.string().email({
    message: 'Digite um email válido',
  }),
  crm: z.string().min(4, {
    message: 'CRM inválido',
  }).max(14),
  cpf: z.string().min(11, {
    message: 'CPF inválido',
  }).max(14),
  dataNascimento: z.string().min(1, {
    message: 'Data de nascimento obrigatória',
  }),
  certificado: z.instanceof(File, {
    message: 'Certificado obrigatório',
  }).optional(),
  foto: z.instanceof(File, {
    message: 'Foto de perfil',
  }).optional(),
  termoConciencia: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos',
  }),
  especialidade: z.string().min(3, {
    message: 'Especialidade é obrigatória',
  }),
  biografia: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CadastroMedico = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [termoDialogOpen, setTermoDialogOpen] = useState(false);
  const [certificadoNome, setCertificadoNome] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      crm: '',
      cpf: '',
      dataNascimento: '',
      termoConciencia: false,
      especialidade: '',
      biografia: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    console.log('Dados do formulário:', data);
    setIsLoading(true);
    
    try {
      // Check if email already exists before proceeding
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', data.email)
        .single();
      
      if (existingUser) {
        toast({
          variant: "destructive",
          title: "Email já cadastrado",
          description: "Este email já está sendo utilizado. Tente fazer login ou use outro email.",
        });
        setIsLoading(false);
        return;
      }
      
      // Format CPF to match database requirements (remove any non-digit characters)
      const formattedCpf = data.cpf.replace(/\D/g, '');
      
      // First, create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: 'Temppass123!', // Temporary password that will be changed later
        options: {
          data: {
            full_name: data.nome,
            tipo_usuario: 'medico',
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData?.user?.id) {
        throw new Error("Falha ao criar usuário");
      }

      // Then create usuario record
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert([
          {
            email: data.email,
            senha: 'Temppass123!', // Temporary password
            tipo_usuario: 'medico',
            status: false // Starts as inactive until verified
          }
        ])
        .select('id')
        .single();

      if (userError) {
        // If error is duplicate key, provide a clear message
        if (userError.code === '23505') {
          toast({
            variant: "destructive",
            title: "Email já cadastrado",
            description: "Este email já está sendo utilizado. Tente fazer login ou use outro email.",
          });
          setIsLoading(false);
          return;
        }
        throw userError;
      }

      // Upload profile photo if provided
      let fotoUrl = null;
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
      
      // Create medico record
      const { error: medicoError } = await supabase
        .from('medicos')
        .insert([
          {
            id_usuario: userData.id,
            nome: data.nome,
            crm: data.crm,
            cpf: formattedCpf,
            especialidade: data.especialidade,
            biografia: data.biografia || null,
            telefone: '', // Will be filled in later
            foto_perfil: fotoUrl,
            status_disponibilidade: false // Starts as inactive until verified and schedule is set
          }
        ]);

      if (medicoError) {
        throw medicoError;
      }
      
      toast({
        title: "Cadastro enviado com sucesso!",
        description: "Aguarde a verificação das suas informações e complete seu cadastro para começar a atender.",
      });
      
      // Redirect to complete registration page (where they'll set schedule and more)
      navigate('/complete-registro-medico');
      
    } catch (error: any) {
      console.error("Erro ao enviar cadastro:", error);
      
      // Handle specific error types
      if (error.code === '23505' || error.message?.includes('unique constraint')) {
        toast({
          variant: "destructive",
          title: "Email já cadastrado",
          description: "Este email já está sendo utilizado. Tente fazer login ou use outro email.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: error.message || "Ocorreu um erro ao enviar seu cadastro. Por favor, tente novamente.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/complete-registro-medico'
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Autenticação com Google iniciada",
        description: "Você será redirecionado para completar o processo.",
      });
    } catch (error) {
      console.error("Erro ao logar com Google:", error);
      toast({
        variant: "destructive",
        title: "Erro na autenticação",
        description: "Não foi possível fazer login com o Google. Por favor, tente novamente.",
      });
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

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCPF(e.target.value);
    form.setValue('cpf', formattedValue);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="hopecann-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-hopecann-green mb-4">Cadastro de Médico</h1>
              <p className="text-gray-600">
                Junte-se à nossa rede de especialistas em tratamentos canábicos
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-8">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full py-3 flex items-center justify-center gap-2"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                      </g>
                    </svg>
                    Continuar com o Google
                  </Button>
                  
                  <div className="relative my-6">
                    <Separator />
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-50 px-2 text-gray-500 text-sm">
                      ou preencha o formulário
                    </span>
                  </div>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Foto de perfil upload */}
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

                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Nome Sobrenome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        name="cpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="000.000.000-00" 
                                {...field} 
                                onChange={(e) => {
                                  handleCPFChange(e);
                                  field.onChange(e);
                                }}
                                maxLength={14}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="dataNascimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="date" {...field} />
                              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="especialidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Neurologia, Psiquiatria, etc." {...field} />
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
                      ) : "Enviar Cadastro"}
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

export default CadastroMedico;
