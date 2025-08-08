import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

const RecuperarSenha = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = async (values: EmailFormValues) => {
    setIsLoading(true);
    setSuccess(false);
    
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('[RecuperarSenha] Enviando email de recuperação para:', values.email);
      console.log('[RecuperarSenha] URL de redirecionamento:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectUrl
      });
      
      if (error) {
        console.error('[RecuperarSenha] Erro ao enviar email:', error);
        throw error;
      }
      
      console.log('[RecuperarSenha] Email enviado com sucesso');
      setSuccess(true);
      toast({
        title: 'E-mail enviado com sucesso!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Erro ao enviar e-mail de recuperação:', error);
      toast({
        title: 'Erro ao enviar e-mail',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-12 bg-gray-50">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-green-600 flex items-center justify-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  E-mail Enviado!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Enviamos um link de recuperação para seu e-mail. Verifique sua caixa de entrada e siga as instruções.
                </p>
                <div className="p-4 bg-blue-50 rounded-lg text-left">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Não recebeu o e-mail?</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Verifique a pasta de spam</li>
                    <li>• Aguarde alguns minutos</li>
                    <li>• Tente novamente com outro e-mail</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Button 
                    onClick={() => setSuccess(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Tentar novamente
                  </Button>
                  <Button 
                    onClick={() => navigate('/login')}
                    className="w-full"
                  >
                    Voltar ao login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Mail className="h-6 w-6 text-hopecann-teal" />
                Recuperar Senha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu e-mail cadastrado"
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="w-full flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ao login
                  </Button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Como funciona:</h4>
                <ol className="text-sm text-gray-700 space-y-1">
                  <li>1. Digite seu e-mail cadastrado</li>
                  <li>2. Receba o link de recuperação</li>
                  <li>3. Clique no link e defina uma nova senha</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecuperarSenha;
