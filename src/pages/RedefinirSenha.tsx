import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const RedefinirSenha = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Verificar se há uma sessão válida para redefinir senha
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          setIsValidSession(false);
        } else if (session) {
          // Verificar se é uma sessão de recuperação de senha
          const accessToken = searchParams.get('access_token');
          const refreshToken = searchParams.get('refresh_token');
          const type = searchParams.get('type');
          
          if (type === 'recovery' || accessToken || refreshToken) {
            setIsValidSession(true);
          } else {
            setIsValidSession(!!session);
          }
        } else {
          // Verificar parâmetros da URL para tokens de recuperação
          const accessToken = searchParams.get('access_token');
          const refreshToken = searchParams.get('refresh_token');
          const type = searchParams.get('type');
          
          if (type === 'recovery' && accessToken && refreshToken) {
            // Definir a sessão com os tokens da URL
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (sessionError) {
              console.error('Erro ao definir sessão:', sessionError);
              setIsValidSession(false);
            } else {
              setIsValidSession(true);
            }
          } else {
            setIsValidSession(false);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setIsValidSession(false);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [searchParams]);

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    if (!isValidSession) {
      toast({
        title: 'Sessão inválida',
        description: 'Link de recuperação inválido ou expirado.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast({
        title: 'Senha redefinida com sucesso!',
        description: 'Sua senha foi atualizada. Você será redirecionado para o login.',
        variant: 'default',
      });

      // Fazer logout para limpar a sessão de recuperação e redirecionar para login
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      
      let errorMessage = 'Erro inesperado ao redefinir senha.';
      
      if (error.message?.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.message?.includes('Unable to validate email address')) {
        errorMessage = 'Não foi possível validar o email. Tente novamente.';
      } else if (error.message?.includes('Invalid session')) {
        errorMessage = 'Sessão de recuperação expirada. Solicite uma nova recuperação de senha.';
      }

      toast({
        title: 'Erro ao redefinir senha',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-12 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hopecann-teal mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando link de recuperação...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-12 bg-gray-50">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-red-600">Link Inválido</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  O link de recuperação de senha é inválido ou expirou.
                </p>
                <Button 
                  onClick={() => navigate('/recuperarsenha')}
                  className="w-full"
                >
                  Solicitar novo link
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Voltar ao login
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                  Senha Redefinida!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Sua senha foi alterada com sucesso. Você será redirecionado para a página de login.
                </p>
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Ir para o login
                </Button>
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
                <Lock className="h-6 w-6 text-hopecann-teal" />
                Criar Nova Senha
              </CardTitle>
              <p className="text-center text-sm text-gray-600 mt-2">
                Você está redefinindo sua senha através do link de recuperação.
                <br />
                <span className="text-hopecann-teal font-medium">Não é necessário informar a senha anterior.</span>
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Sua Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua nova senha"
                      {...form.register('password')}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Sua Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme sua nova senha"
                      {...form.register('confirmPassword')}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Criando Nova Senha...' : 'Criar Nova Senha'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Requisitos da nova senha:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Mínimo de 6 caracteres</li>
                  <li>• As senhas devem coincidir</li>
                </ul>
              </div>
              
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">🔐 Link de Recuperação Válido</h4>
                <p className="text-sm text-green-700">
                  Você está usando um link seguro de recuperação de senha. 
                  Não precisa informar sua senha antiga - apenas defina uma nova senha.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RedefinirSenha;
