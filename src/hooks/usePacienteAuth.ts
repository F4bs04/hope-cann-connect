
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePacienteAuth = () => {
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        
        if (!userEmail) {
          toast({
            title: "Acesso não autorizado",
            description: "Faça login para acessar a área do paciente.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }
        
        const { data: pacienteData, error } = await supabase
          .from('pacientes_app')
          .select('*')
          .eq('email', userEmail)
          .single();
        
        if (error) throw error;
        
        if (pacienteData) {
          setPaciente(pacienteData);
        } else {
          toast({
            title: "Perfil não encontrado",
            description: "Não encontramos um perfil de paciente associado ao seu login.",
            variant: "destructive"
          });
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userEmail');
          navigate('/login');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        toast({
          title: "Erro de autenticação",
          description: "Ocorreu um erro ao verificar suas credenciais. Por favor, faça login novamente.",
          variant: "destructive"
        });
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  return { paciente, loading };
};
