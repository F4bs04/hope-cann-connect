
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
      // Step 1: Authenticate with Supabase
      const { data, error } = await supabase.from('usuarios').select('*').eq('email', values.email).single();

      if (error) {
        throw new Error("Credenciais inválidas. Verifique seu email e senha.");
      }

      if (!data) {
        throw new Error("Usuário não encontrado");
      }

      // Verify password (in a real app, use proper password hashing)
      if (data.senha !== values.password) {
        throw new Error("Senha incorreta");
      }

      // Update last access time
      await supabase
        .from('usuarios')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', data.id);

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
      switch (data.tipo_usuario) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6">Acesse sua conta</h1>
          
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
            onClick={() => {
              toast({
                title: "Login Google indisponível",
                description: "Esta funcionalidade será implementada em breve.",
              });
            }}
            disabled={isLoading}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5453 6.5H8.5V9.5H12.6039C12.0442 11.3 10.4228 12.5 8.5 12.5C6.01614 12.5 4 10.4839 4 8C4 5.51614 6.01614 3.5 8.5 3.5C9.56267 3.5 10.5392 3.88194 11.3193 4.5H14.3283C12.9325 2.38305 10.8553 1 8.5 1C4.63396 1 1.5 4.13396 1.5 8C1.5 11.866 4.63396 15 8.5 15C12.3667 15 15 12.3667 15 8.5C15 7.83193 14.7726 7.15722 14.5453 6.5H15.5453Z" fill="#4285F4"/>
            </svg>
            Google
          </Button>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <a href="#" className="text-hopecann-teal hover:underline">
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
