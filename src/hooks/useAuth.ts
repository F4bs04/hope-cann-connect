
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
        
        if (!userEmail) {
          throw new Error("Não autenticado");
        }
        
        const { data: userData, error } = await supabase
          .from('usuarios')
          .select('tipo_usuario')
          .eq('email', userEmail)
          .single();
        
        if (error) throw error;
        
        if (userData) {
          setUserType(userData.tipo_usuario);
          localStorage.setItem('userType', userData.tipo_usuario);

          // Redirect based on user type
          switch (userData.tipo_usuario) {
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
              throw new Error("Tipo de usuário inválido");
          }
        } else {
          throw new Error("Usuário não encontrado");
        }
      } catch (error: any) {
        console.error('Authentication error:', error);
        toast({
          title: "Erro de autenticação",
          description: "Por favor, faça login novamente.",
          variant: "destructive"
        });
        localStorage.clear();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  return { loading, userType };
};
