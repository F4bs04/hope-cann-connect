
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Insira um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const useLoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
      // First check if the email exists in the system
      const { data: userExists, error: emailCheckError } = await supabase
        .from('usuarios')
        .select('id, email')
        .eq('email', values.email)
        .maybeSingle();

      if (emailCheckError) {
        console.error("Email check error:", emailCheckError);
        throw new Error("Erro ao verificar email. Tente novamente.");
      }
      
      if (!userExists) {
        throw new Error("Usuário não encontrado. Verifique seu email.");
      }

      // Then verify credentials
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', values.email)
        .eq('senha', values.password)
        .maybeSingle();

      if (error) {
        console.error("Login query error:", error);
        throw new Error("Erro ao verificar credenciais. Tente novamente.");
      }
      
      if (!data) {
        throw new Error("Senha incorreta. Tente novamente.");
      }

      // Save auth data to localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', values.email);
      localStorage.setItem('userId', data.id.toString());
      localStorage.setItem('userType', data.tipo_usuario);
      localStorage.setItem('authTimestamp', Date.now().toString());

      // Update last access timestamp
      await supabase
        .from('usuarios')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', data.id);

      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao sistema!"
      });

      // Navigate based on user type
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

  return {
    form,
    isLoading,
    authError,
    handleLogin,
    setAuthError
  };
};
