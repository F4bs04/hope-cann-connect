
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Info, Check, Upload, Calendar } from 'lucide-react';
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

const formSchema = z.object({
  nome: z.string().min(3, {
    message: 'O nome deve ter pelo menos 3 caracteres',
  }),
  email: z.string().email({
    message: 'Digite um email válido',
  }),
  crm: z.string().min(4, {
    message: 'CRM inválido',
  }),
  cpf: z.string().min(11, {
    message: 'CPF inválido',
  }).max(14),
  dataNascimento: z.string().min(1, {
    message: 'Data de nascimento obrigatória',
  }),
  certificado: z.instanceof(File, {
    message: 'Certificado obrigatório',
  }).optional(),
  termoConciencia: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const CadastroMedico = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [termoDialogOpen, setTermoDialogOpen] = React.useState(false);
  const [certificadoNome, setCertificadoNome] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      crm: '',
      cpf: '',
      dataNascimento: '',
      termoConciencia: false,
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log('Dados do formulário:', data);
    
    toast({
      title: "Cadastro enviado com sucesso!",
      description: "Aguarde a verificação das suas informações",
    });
    
    // Normalmente enviaríamos os dados para o backend aqui
    // Por enquanto, apenas redirecionamos para a página de login
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
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
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                  onChange={handleFileChange}
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
                    >
                      Enviar Cadastro
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
