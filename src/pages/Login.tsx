import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const loginSchema = z.object({
  email: z.string().email("Insira um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', values.email)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Usuário não encontrado");
      if (data.senha !== values.password) throw new Error("Senha incorreta");

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', values.email);
      localStorage.setItem('userId', data.id.toString());
      localStorage.setItem('userType', data.tipo_usuario);
      localStorage.setItem('authTimestamp', Date.now().toString());

      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao sistema!"
      });

      // Redirect based on user type
      switch (data.tipo_usuario) {
        case 'medico':
          navigate('/area-medico');
          break;
        case 'paciente':
          navigate('/area-paciente');
          break;
        case 'admin_clinica':
          navigate('/admin');
          break;
        default:
          navigate('/area-paciente');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthError(error.message || "Ocorreu um erro ao fazer login. Tente novamente.");
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Erro ao fazer login com Google",
        description: error.message || "Ocorreu um erro ao fazer login com Google. Tente novamente.",
        variant: "destructive"
      });
      setGoogleLoading(false);
    }
  };
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session?.provider_token) {
        const user = session.user;
        if (user) {
          setUserAvatar(user.user_metadata.avatar_url);
          const {
            data: userData,
            error: userError
          } = await supabase.from('usuarios').select('*').eq('email', user.email).single();
          if (userError) {
            const {
              data: newUser,
              error: createError
            } = await supabase.from('usuarios').insert([{
              email: user.email,
              senha: '',
              tipo_usuario: 'paciente',
              ultimo_acesso: new Date().toISOString()
            }]).select().single();
            if (createError) {
              throw createError;
            }
            if (newUser) {
              await supabase.from('pacientes').insert([{
                id_usuario: newUser.id,
                nome: user.user_metadata.full_name || user.email?.split('@')[0] || '',
                cpf: '',
                data_nascimento: new Date('2000-01-01').toISOString(),
                endereco: '',
                telefone: '',
                email: user.email || ''
              }]);
              localStorage.setItem('isAuthenticated', 'true');
              localStorage.setItem('userEmail', user.email || '');
              localStorage.setItem('userId', newUser.id.toString());
              localStorage.setItem('userType', 'paciente');
              localStorage.setItem('userAvatar', user.user_metadata.avatar_url || '');
              localStorage.setItem('authTimestamp', Date.now().toString());
              toast({
                title: "Conta criada com sucesso",
                description: "Bem-vindo ao sistema! Por favor, complete seu perfil."
              });
              navigate('/area-paciente');
            }
          } else {
            await supabase.from('usuarios').update({
              ultimo_acesso: new Date().toISOString()
            }).eq('id', userData.id);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', user.email || '');
            localStorage.setItem('userId', userData.id.toString());
            localStorage.setItem('userType', userData.tipo_usuario);
            localStorage.setItem('userAvatar', user.user_metadata.avatar_url || '');
            localStorage.setItem('authTimestamp', Date.now().toString());
            toast({
              title: "Login bem-sucedido",
              description: "Bem-vindo de volta ao sistema!"
            });
            redirectBasedOnUserType(userData.tipo_usuario);
          }
        }
      }
      setGoogleLoading(false);
    };
    checkSession();
  }, []);
  const redirectBasedOnUserType = (userType: string) => {
    console.log("Redirecting user with type:", userType);
    switch (userType) {
      case 'paciente':
        navigate('/area-paciente', {
          replace: true
        });
        break;
      case 'medico':
        navigate('/area-medico', {
          replace: true
        });
        break;
      case 'admin_clinica':
        navigate('/admin', {
          replace: true
        });
        break;
      default:
        navigate('/area-paciente', {
          replace: true
        });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6">Acesse sua conta</h1>
          
          {userAvatar && (
            <div className="flex justify-center mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userAvatar} alt="User avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          )}
          
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{authError}</p>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <FormControl>
                        <Input placeholder="seu@email.com" className="pl-10" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full bg-hopecann-teal hover:bg-hopecann-teal/90 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-1" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </Form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">ou continue com</span>
            </div>
          </div>
          
          <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2 mb-4" onClick={handleGoogleLogin} disabled={googleLoading}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5453 6.5H8.5V9.5H12.6039C12.0442 11.3 10.4228 12.5 8.5 12.5C6.01614 12.5 4 10.4839 4 8C4 5.51614 6.01614 3.5 8.5 3.5C9.56267 3.5 10.5392 3.88194 11.3193 4.5H14.3283C12.9325 2.38305 10.8553 1 8.5 1C4.63396 1 1.5 4.13396 1.5 8C1.5 11.866 4.63396 15 8.5 15C12.3667 15 15 12.3667 15 8.5C15 7.83193 14.7726 7.15722 14.5453 6.5H15.5453Z" fill="#4285F4" />
            </svg>
            {googleLoading ? <>
                <div className="h-4 w-4 border-2 border-hopecann-teal border-t-transparent rounded-full animate-spin mr-2"></div>
                Processando...
              </> : "Google"}
          </Button>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <a href="/cadastro" className="text-hopecann-teal hover:underline">
                Cadastre-se
              </a>
            </p>
            <a href="#" className="text-sm text-hopecann-teal hover:underline mt-2 inline-block">
              Esqueceu sua senha?
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
