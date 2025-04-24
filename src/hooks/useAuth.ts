
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        const storedUserType = localStorage.getItem('userType');
        
        if (!userEmail || !isAuthenticated) {
          throw new Error("Não autenticado");
        }
        
        let userData = null;
        
        // Verifica o tipo de usuário armazenado e busca os dados correspondentes
        if (storedUserType === 'admin_clinica') {
          // Buscar dados da clínica
          const { data: clinicData, error: clinicError } = await supabase
            .from('clinicas')
            .select('*')
            .eq('email', userEmail)
            .maybeSingle();
            
          if (clinicError) throw clinicError;
          userData = clinicData;
        } else if (storedUserType === 'medico') {
          // Buscar dados do médico
          const userId = localStorage.getItem('userId');
          if (!userId) throw new Error("ID do usuário não encontrado");
          
          const { data: medicoData, error: medicoError } = await supabase
            .from('medicos')
            .select('*')
            .eq('id_usuario', parseInt(userId))
            .maybeSingle();
            
          if (medicoError) throw medicoError;
          userData = medicoData;
        } else {
          // Buscar dados do usuário/paciente
          const { data: userInfo, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', userEmail)
            .maybeSingle();
          
          if (userError) {
            console.error("User lookup error:", userError);
            throw new Error("Erro ao verificar usuário");
          }
          
          if (!userInfo) {
            console.error("User not found:", userEmail);
            throw new Error("Usuário não encontrado");
          }
          
          userData = userInfo;
          
          // Se for paciente, buscar dados adicionais do paciente
          if (userInfo.tipo_usuario === 'paciente') {
            const { data: pacienteData, error: pacienteError } = await supabase
              .from('pacientes')
              .select('*')
              .eq('id_usuario', userInfo.id)
              .maybeSingle();
              
            if (!pacienteError && pacienteData) {
              userData = { ...userData, ...pacienteData };
            }
          }
        }
        
        // Armazena os dados do usuário no estado
        setUserData(userData);
        setUserType(storedUserType);
        console.log("Usuário autenticado:", userData);

        // Only redirect if we're not already on the correct path
        const currentPath = window.location.pathname;
        const correctPath = getCorrectPath(storedUserType || 'paciente');
        
        if (currentPath !== correctPath && !currentPath.startsWith(correctPath)) {
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

  return { loading, userType, userData };
};
