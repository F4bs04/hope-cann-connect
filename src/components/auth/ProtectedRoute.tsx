
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
        toast({
          title: "Acesso não autorizado",
          description: "Faça login para acessar esta área.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      if (!allowedUserTypes.includes(userType)) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta área.",
          variant: "destructive"
        });
        navigate('/login');
      }
    };

    checkAccess();
  }, [navigate, toast, allowedUserTypes]);

  return <>{children}</>;
};

export default ProtectedRoute;
