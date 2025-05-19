
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { verifyClinicPassword } from "@/services/supabaseService";

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
      console.log("[useLoginForm] Iniciando processo de login para:", values.email);
      
      // Check if email exists in clinicas table first
      const { data: clinicExists, error: clinicError } = await supabase
        .from('clinicas')
        .select('id, nome, email')
        .eq('email', values.email)
        .maybeSingle();

      if (clinicError) throw clinicError;

      // If clinic exists, verify password using the new function
      if (clinicExists) {
        console.log("[useLoginForm] Email encontrado como clínica:", values.email);
        const isValidPassword = await verifyClinicPassword(values.email, values.password);
        
        if (!isValidPassword) {
          throw new Error("Senha incorreta. Tente novamente.");
        }

        // Login successful for clinic - store authentication data in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', values.email);
        localStorage.setItem('userId', clinicExists.id.toString());
        localStorage.setItem('userType', 'admin_clinica');
        localStorage.setItem('authTimestamp', Date.now().toString());
        
        // Try to create a Supabase auth session but don't block if it fails
        try {
          await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password
          });
        } catch (authError) {
          console.log("[useLoginForm] Falha na autenticação Supabase para clínica, usando apenas auth local");
        }
        
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo à área administrativa da clínica!"
        });
        
        navigate('/admin');
        return;
      }

      // If not a clinic, continue with existing user login logic
      console.log("[useLoginForm] Verificando usuário na tabela usuarios:", values.email);
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', values.email)
        .eq('senha', values.password)
        .maybeSingle();

      if (error) {
        console.error("[useLoginForm] Erro na query de login:", error);
        throw new Error("Erro ao verificar credenciais. Tente novamente.");
      }
      
      if (!data) {
        console.error("[useLoginForm] Usuário não encontrado:", values.email);
        throw new Error("Usuário não encontrado ou senha incorreta. Verifique suas credenciais.");
      }

      console.log("[useLoginForm] Usuário encontrado:", data);

      // Store the authentication data in localStorage FIRST
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

      // If user is a doctor, fetch doctor ID and store it
      if (data.tipo_usuario === 'medico') {
        console.log("[useLoginForm] Buscando ID do médico para:", values.email);
        const { data: medicoData, error: medicoError } = await supabase
          .from('medicos')
          .select('id')
          .eq('id_usuario', data.id)
          .maybeSingle();
          
        if (!medicoError && medicoData) {
          console.log("[useLoginForm] ID do médico encontrado:", medicoData.id);
          localStorage.setItem('medicoId', medicoData.id.toString());
        }
      }

      // Try to authenticate with Supabase auth as well, but don't block if it fails
      try {
        await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password
        });
        console.log("[useLoginForm] Autenticação Supabase realizada com sucesso");
      } catch (authError) {
        console.log("[useLoginForm] Falha na autenticação Supabase, usando apenas auth local");
      }

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
      console.error("[useLoginForm] Erro de login:", error);
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
