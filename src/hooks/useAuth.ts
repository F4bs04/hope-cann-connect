
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        
        if (!userEmail || !isAuthenticated) {
          throw new Error("Não autenticado");
        }
        
        const { data: userData, error } = await supabase
          .from('usuarios')
          .select('tipo_usuario')
          .eq('email', userEmail)
          .maybeSingle();
        
        if (error) {
          console.error("User lookup error:", error);
          throw new Error("Erro ao verificar usuário");
        }
        
        if (!userData) {
          console.error("User not found:", userEmail);
          throw new Error("Usuário não encontrado");
        }
        
        setUserType(userData.tipo_usuario);
        localStorage.setItem('userType', userData.tipo_usuario);

        // Only redirect if we're not already on the correct page
        const currentPath = window.location.pathname;
        const correctPath = getCorrectPath(userData.tipo_usuario);
        
        if (currentPath !== correctPath) {
          navigate(correctPath);
        }
      } catch (error: any) {
        console.error('Authentication error:', error);
        toast({
          title: "Erro de autenticação",
          description: error.message || "Por favor, faça login novamente.",
          variant: "destructive"
        });
        // Clear auth data
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        localStorage.removeItem('authTimestamp');
        localStorage.removeItem('userAvatar');
        
        // Only navigate to login if we're not already there
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  // Helper function to get the correct path based on user type
  const getCorrectPath = (userType: string): string => {
    switch (userType) {
      case 'medico':
        return '/area-medico';
      case 'paciente':
        return '/area-paciente';
      case 'admin_clinica':
        return '/admin';
      default:
        return '/area-paciente';
    }
  };

  return { loading, userType };
};
