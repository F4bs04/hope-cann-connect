
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
      // Check if email exists in clinicas table first
      const { data: clinicExists, error: clinicError } = await supabase
        .from('clinicas')
        .select('id, nome, email')
        .eq('email', values.email)
        .maybeSingle();

      if (clinicError) throw clinicError;

      // If clinic exists, verify password using the new function
      if (clinicExists) {
        const isValidPassword = await verifyClinicPassword(values.email, values.password);
        
        if (!isValidPassword) {
          throw new Error("Senha incorreta. Tente novamente.");
        }

        // Login successful for clinic
        // Create a Supabase auth session using signInWithPassword so the Supabase Auth state is synchronized
        // Even though we're using a separate clinic login system, we simulate a user account
        try {
          // First check if a user account exists for this clinic
          let { data: authUser } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password
          });
          
          // If this clinic doesn't have a corresponding auth user, create dummy session data
          if (!authUser.session) {
            // Store the authentication data in localStorage
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', values.email);
            localStorage.setItem('userId', clinicExists.id.toString());
            localStorage.setItem('userType', 'admin_clinica');
            localStorage.setItem('authTimestamp', Date.now().toString());
          }
        } catch (authError) {
          console.log("No matching auth user for clinic, using local auth only");
        }
        
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo à área administrativa da clínica!"
        });
        
        navigate('/admin');
        return;
      }

      // If not a clinic, continue with existing user login logic
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
        throw new Error("Usuário não encontrado. Verifique seu email.");
      }

      // User authentication successful - try to authenticate with Supabase auth as well
      try {
        // Try to sign in with Supabase Auth
        await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password
        });
      } catch (authError) {
        console.log("Could not authenticate with Supabase auth, using local auth only");
      }

      // Store the authentication data in localStorage
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
