
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedUserTypes }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAccess = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const userType = localStorage.getItem('userType');
      
      if (!isAuthenticated || !userType) {
        console.log("Usuário não autenticado, redirecionando para /login");
        toast({
          title: "Acesso não autorizado",
          description: "Faça login para acessar esta área.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      // Verificar se o tipo de usuário tem permissão para acessar esta rota
      if (!allowedUserTypes.includes(userType)) {
        console.log(`Usuário do tipo ${userType} tentando acessar área restrita a ${allowedUserTypes.join(', ')}`);
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta área.",
          variant: "destructive"
        });
        
        // Redirecionar para a área correta com base no tipo de usuário
        switch (userType) {
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
            navigate('/login');
        }
        return;
      }
    };

    checkAccess();
  }, [navigate, toast, allowedUserTypes]);

  return <>{children}</>;
};

export default ProtectedRoute;
