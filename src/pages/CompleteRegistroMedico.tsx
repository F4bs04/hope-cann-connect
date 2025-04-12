
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Info, Upload, Camera, User } from 'lucide-react';
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
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  crm: z.string().min(4, {
    message: 'CRM inválido',
  }).max(14),
  certificado: z.instanceof(File, {
    message: 'Certificado obrigatório',
  }),
  foto: z.instanceof(File, {
    message: 'Foto de perfil',
  }).optional(),
  termoConciencia: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const CompleteRegistroMedico = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [termoDialogOpen, setTermoDialogOpen] = useState(false);
  const [certificadoNome, setCertificadoNome] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{name?: string, email?: string, photoUrl?: string} | null>(null);

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
        setUserInfo({
          name: user.user_metadata?.full_name,
          email: user.email,
          photoUrl: user.user_metadata?.avatar_url
        });
        
        if (user.user_metadata?.avatar_url) {
          setFotoPreview(user.user_metadata.avatar_url);
        }
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crm: '',
      termoConciencia: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    console.log('Dados complementares:', data);
    setIsLoading(true);
    
    try {
      // Aqui seria feito o upload da foto e registro no banco de dados
      toast({
        title: "Cadastro concluído com sucesso!",
        description: "Suas informações foram enviadas para verificação.",
      });
      
      // Normalmente enviaríamos os dados para o backend aqui
      
      setTimeout(() => {
        navigate('/login');
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao enviar dados complementares:", error);
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.",
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
