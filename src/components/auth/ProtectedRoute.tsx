
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedUserTypes }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        setIsAuthenticated(true);
        
        // Get user type from database
        const { data: userInfo, error } = await supabase
          .from('usuarios')
          .select('tipo_usuario')
          .eq('email', session.user.email)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching user type:', error);
          setUserType(null);
        } else if (userInfo) {
          setUserType(userInfo.tipo_usuario);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Only render redirect elements when loading is complete
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  // Move toast and redirects outside of render function
  if (!isAuthenticated) {
    // Using useEffect here would be better, but for simplicity in this fix:
    if (typeof window !== 'undefined' && !localStorage.getItem('toast-shown-auth')) {
      toast({
        variant: "destructive",
        title: "Acesso restrito",
        description: "Faça login para acessar esta página.",
      });
      localStorage.setItem('toast-shown-auth', 'true');
      // Remove this item after a delay
      setTimeout(() => localStorage.removeItem('toast-shown-auth'), 2000);
    }
    return <Navigate to="/login" />;
  }

  if (userType && !allowedUserTypes.includes(userType)) {
    // Using useEffect here would be better, but for simplicity in this fix:
    if (typeof window !== 'undefined' && !localStorage.getItem('toast-shown-perm')) {
      toast({
        variant: "destructive",
        title: "Acesso não autorizado",
        description: "Você não tem permissão para acessar esta página.",
      });
      localStorage.setItem('toast-shown-perm', 'true');
      // Remove this item after a delay
      setTimeout(() => localStorage.removeItem('toast-shown-perm'), 2000);
    }
    
    // Redirect based on user type
    if (userType === 'medico') {
      return <Navigate to="/area-medico" />;
    } else if (userType === 'paciente') {
      return <Navigate to="/area-paciente" />;
    } else if (userType === 'admin_clinica') {
      return <Navigate to="/admin" />;
    }
    
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
