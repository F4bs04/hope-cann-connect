
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define the login form schema
const loginSchema = z.object({
  email: z.string().email("Insira um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  captcha: z.string().min(1, "Por favor, resolva o CAPTCHA"),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Setup form with react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      captcha: "",
      rememberMe: false,
    },
  });

  // Generate a simple CAPTCHA
  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    setCaptchaValue(`${num1} + ${num2} = ?`);
    setCaptchaAnswer((num1 + num2).toString());
  };

  const handleLogin = async (values: LoginFormValues) => {
    if (values.captcha !== captchaAnswer) {
      toast({
        title: "CAPTCHA incorreto",
        description: "Por favor, resolva o CAPTCHA corretamente",
        variant: "destructive",
      });
      generateCaptcha();
      form.setValue("captcha", "");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting login with:", values.email);
      
      // Step 1: Authenticate with Supabase
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', values.email)
        .single();

      if (error) {
        console.error("Login query error:", error);
        throw new Error("Credenciais inválidas. Verifique seu email e senha.");
      }

      if (!data) {
        throw new Error("Usuário não encontrado");
      }

      console.log("User found:", data);

      // Verify password (in a real app, use proper password hashing)
      if (data.senha !== values.password) {
        throw new Error("Senha incorreta");
      }

      // Update last access time
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', data.id);
        
      if (updateError) {
        console.error("Failed to update last access time:", updateError);
        // Don't throw here, continue with login
      }

      // Store user info in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', values.email);
      localStorage.setItem('userId', data.id.toString());
      localStorage.setItem('userType', data.tipo_usuario);

      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao sistema!",
      });

      // Redirect based on user type
      redirectBasedOnUserType(data.tipo_usuario);
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const redirectBasedOnUserType = (userType: string) => {
    switch (userType) {
      case 'paciente':
        navigate('/area-paciente');
        break;
      case 'medico':
        navigate('/area-medico');
        break;
      case 'admin_clinica':
        navigate('/admin');
        break;
      default:
        navigate('/area-paciente');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Erro ao fazer login com Google",
        description: error.message || "Ocorreu um erro ao fazer login com Google. Tente novamente.",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  // Check if this is a redirect from Google OAuth
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.provider_token) {
        // User authenticated with Google
        const user = session.user;
        
        if (user) {
          setUserAvatar(user.user_metadata.avatar_url);
          
          // Check if user exists in our database
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', user.email)
            .single();
          
          if (userError) {
            // User doesn't exist, create a new user
            const { data: newUser, error: createError } = await supabase
              .from('usuarios')
              .insert([
                {
                  email: user.email,
                  senha: '', // No password for Google users
                  tipo_usuario: 'paciente', // Default to patient
                  ultimo_acesso: new Date().toISOString()
                }
              ])
              .select()
              .single();
            
            if (createError) {
              throw createError;
            }

            // Create a patient record
            if (newUser) {
              await supabase.from('pacientes').insert([
                {
                  id_usuario: newUser.id,
                  nome: user.user_metadata.full_name || user.email?.split('@')[0] || '',
                  cpf: '', // Require user to fill this later
                  data_nascimento: new Date('2000-01-01').toISOString(), // Default
                  endereco: '',
                  telefone: '',
                  email: user.email || ''
                }
              ]);
              
              localStorage.setItem('isAuthenticated', 'true');
              localStorage.setItem('userEmail', user.email || '');
              localStorage.setItem('userId', newUser.id.toString());
              localStorage.setItem('userType', 'paciente');
              localStorage.setItem('userAvatar', user.user_metadata.avatar_url || '');
              
              toast({
                title: "Conta criada com sucesso",
                description: "Bem-vindo ao sistema! Por favor, complete seu perfil.",
              });
              
              navigate('/area-paciente');
            }
          } else {
            // User exists, update last access and log them in
            await supabase
              .from('usuarios')
              .update({ ultimo_acesso: new Date().toISOString() })
              .eq('id', userData.id);
            
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', user.email || '');
            localStorage.setItem('userId', userData.id.toString());
            localStorage.setItem('userType', userData.tipo_usuario);
            localStorage.setItem('userAvatar', user.user_metadata.avatar_url || '');
            
            toast({
              title: "Login bem-sucedido",
              description: "Bem-vindo de volta ao sistema!",
            });
            
            redirectBasedOnUserType(userData.tipo_usuario);
          }
        }
      }
      setGoogleLoading(false);
    };
    
    checkSession();
  }, []);

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
                        <Input
                          placeholder="seu@email.com"
                          className="pl-10"
                          {...field}
                        />
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
              
              <FormField
                control={form.control}
                name="captcha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CAPTCHA</FormLabel>
                    <div className="bg-gray-100 p-3 rounded-md text-center font-semibold mb-2">
                      {captchaValue}
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Digite a resposta"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="text-sm text-hopecann-teal hover:underline mt-1"
                      onClick={generateCaptcha}
                    >
                      Gerar novo CAPTCHA
                    </button>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm cursor-pointer">
                        Lembrar de mim
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-hopecann-teal hover:bg-hopecann-teal/90" 
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Entrar"}
              </Button>
            </form>
          </Form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">ou continue com</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 mb-4"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5453 6.5H8.5V9.5H12.6039C12.0442 11.3 10.4228 12.5 8.5 12.5C6.01614 12.5 4 10.4839 4 8C4 5.51614 6.01614 3.5 8.5 3.5C9.56267 3.5 10.5392 3.88194 11.3193 4.5H14.3283C12.9325 2.38305 10.8553 1 8.5 1C4.63396 1 1.5 4.13396 1.5 8C1.5 11.866 4.63396 15 8.5 15C12.3667 15 15 12.3667 15 8.5C15 7.83193 14.7726 7.15722 14.5453 6.5H15.5453Z" fill="#4285F4"/>
            </svg>
            {googleLoading ? "Processando..." : "Google"}
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
