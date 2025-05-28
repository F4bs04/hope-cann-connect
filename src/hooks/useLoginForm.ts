import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { verifyClinicPassword as verifyClinicPasswordService } from "@/services/supabaseService";

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

      if (clinicError) {
        console.error("Clinic lookup error:", clinicError);
        throw new Error("Erro ao verificar dados da clínica. Tente novamente.");
      }

      // If clinic exists, verify password using the specific clinic password function
      if (clinicExists) {
        const isValidPassword = await verifyClinicPasswordService(values.email, values.password);
        
        if (!isValidPassword) {
          throw new Error("Senha da clínica incorreta. Tente novamente.");
        }

        // Login successful for clinic
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', values.email);
        localStorage.setItem('userId', clinicExists.id.toString());
        localStorage.setItem('userType', 'admin_clinica');
        localStorage.setItem('authTimestamp', Date.now().toString());
        
        // Attempt to sign in with Supabase Auth for session synchronization if a corresponding auth.users account exists
        try {
          await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password // This might fail if the clinic password isn't synced with auth.users
          });
        } catch (authSessionError) {
          console.log("Could not create Supabase auth session for clinic admin, using local auth only:", authSessionError);
        }
        
        toast({
          title: "Login da clínica bem-sucedido",
          description: "Bem-vindo à área administrativa da clínica!"
        });
        
        navigate('/admin');
        return;
      }

      // If not a clinic, continue with user login logic using RPC for password verification
      const { data: userData, error: userFetchError } = await supabase
        .from('usuarios')
        .select('*') // Seleciona todos os dados do usuário para uso posterior
        .eq('email', values.email)
        .maybeSingle();

      if (userFetchError) {
        console.error("User lookup error:", userFetchError);
        throw new Error("Erro ao buscar dados do usuário. Tente novamente.");
      }
      
      if (!userData) {
        throw new Error("Usuário não encontrado. Verifique seu email.");
      }

      // Verify password using the RPC function
      const { data: isValidPassword, error: rpcError } = await supabase.rpc('verify_user_password', {
        p_email: values.email,
        p_password: values.password
      });

      if (rpcError) {
        console.error("RPC verify_user_password error:", rpcError);
        throw new Error("Erro ao verificar credenciais. Tente novamente.");
      }

      if (!isValidPassword) {
        throw new Error("Senha incorreta. Tente novamente.");
      }
      
      // User authentication successful - try to authenticate with Supabase auth as well
      // to keep session state synchronized if an auth.users account exists.
      try {
        await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password
        });
      } catch (authSessionError) {
        console.log("Could not create/sync Supabase auth session for user, using local auth only for now:", authSessionError);
      }

      // Store the authentication data in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', values.email);
      localStorage.setItem('userId', userData.id.toString());
      localStorage.setItem('userType', userData.tipo_usuario);
      localStorage.setItem('authTimestamp', Date.now().toString());

      // Update last access timestamp
      await supabase
        .from('usuarios')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', userData.id);

      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao sistema!"
      });

      // Navigate based on user type
      switch (userData.tipo_usuario) {
        case 'medico':
          navigate('/area-medico');
          break;
        case 'paciente':
          navigate('/area-paciente');
          break;
        // admin_clinica is handled above, but kept here for robustness
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
