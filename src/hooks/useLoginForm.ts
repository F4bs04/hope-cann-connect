
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
      // Primeiro, verificamos se o email existe em alguma das tabelas
      
      // 1. Verificar na tabela de usuários (para pacientes principalmente)
      const { data: userExists, error: userCheckError } = await supabase
        .from('usuarios')
        .select('id, email, tipo_usuario')
        .eq('email', values.email)
        .maybeSingle();
      
      if (userCheckError) {
        console.error("User check error:", userCheckError);
        throw new Error("Erro ao verificar email. Tente novamente.");
      }
      
      // 2. Verificar na tabela de clínicas
      const { data: clinicExists, error: clinicCheckError } = await supabase
        .from('clinicas')
        .select('id, email')
        .eq('email', values.email)
        .maybeSingle();
        
      if (clinicCheckError) {
        console.error("Clinic check error:", clinicCheckError);
        throw new Error("Erro ao verificar email. Tente novamente.");
      }
      
      // 3. Se não está em nenhuma tabela, usuário não existe
      if (!userExists && !clinicExists) {
        throw new Error("Usuário não encontrado. Verifique seu email.");
      }
      
      // Autenticação baseada no tipo de usuário encontrado
      if (clinicExists) {
        // Verificar credenciais para clínica
        const { data: clinicData, error: clinicAuthError } = await supabase
          .from('clinicas')
          .select('id, nome, email, senha_hash')
          .eq('email', values.email)
          .maybeSingle();
        
        if (clinicAuthError) {
          console.error("Clinic auth error:", clinicAuthError);
          throw new Error("Erro ao verificar credenciais. Tente novamente.");
        }
        
        // Verificar senha da clínica usando o procedimento do banco
        const { data: isValidPassword, error: passwordCheckError } = await supabase
          .rpc('verify_clinic_password', {
            p_email: values.email,
            p_password: values.password
          });
        
        if (passwordCheckError || !isValidPassword) {
          console.error("Password check error:", passwordCheckError);
          throw new Error("Senha incorreta. Tente novamente.");
        }
        
        // Login bem-sucedido para clínica
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', values.email);
        localStorage.setItem('userId', clinicData.id.toString());
        localStorage.setItem('userType', 'admin_clinica');
        localStorage.setItem('authTimestamp', Date.now().toString());
        
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta à área administrativa da clínica!"
        });
        
        navigate('/admin');
        
      } else if (userExists) {
        // Continuar com o fluxo existente para usuários regulares
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

        // Autenticação bem-sucedida para usuário regular
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', values.email);
        localStorage.setItem('userId', data.id.toString());
        localStorage.setItem('userType', data.tipo_usuario);
        localStorage.setItem('authTimestamp', Date.now().toString());

        // Atualizar timestamp de último acesso
        await supabase
          .from('usuarios')
          .update({ ultimo_acesso: new Date().toISOString() })
          .eq('id', data.id);

        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao sistema!"
        });

        // Navegar com base no tipo de usuário
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
