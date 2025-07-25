
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
        // First check Supabase Auth session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Then check localStorage-based authentication
        const localStorageAuth = localStorage.getItem('isAuthenticated') === 'true';
        const localStorageUserType = localStorage.getItem('userType');
        const localStorageAuthTimestamp = localStorage.getItem('authTimestamp');
        const localStorageEmail = localStorage.getItem('userEmail');
        
        // Check if the local storage auth token is expired (24 hours)
        let localAuthExpired = false;
        if (localStorageAuthTimestamp) {
          const authTimestamp = parseInt(localStorageAuthTimestamp);
          const now = Date.now();
          const authAgeDays = (now - authTimestamp) / (1000 * 60 * 60 * 24);
          localAuthExpired = authAgeDays > 1; // expired after 1 day
          
          if (localAuthExpired) {
            // Clear expired authentication
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');
            localStorage.removeItem('userType');
            localStorage.removeItem('authTimestamp');
          }
        }
        
        // User is authenticated if either Supabase session exists or localStorage auth is valid
        const isUserAuthenticated = !!session || (localStorageAuth && !localAuthExpired);
        setIsAuthenticated(isUserAuthenticated);
        
        if (!isUserAuthenticated) {
          setLoading(false);
          return;
        }
        
        // Get user type, preferring Supabase session if it exists
        if (session) {
          // Get user type from database
          const { data: profileInfo, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (error) {
            console.error('Error fetching user type:', error);
            setUserType(null);
          } else if (profileInfo) {
            // Convert role to userType format
            const userTypeMapping: Record<string, string> = {
              'doctor': 'medico',
              'patient': 'paciente',
              'system_admin': 'admin_clinica'
            };
            const mappedUserType = userTypeMapping[profileInfo.role] || 'paciente';
            setUserType(mappedUserType);
            
            // Atualiza localStorage com os dados mais recentes
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', session.user.email || '');
            localStorage.setItem('userType', mappedUserType);
            localStorage.setItem('authTimestamp', Date.now().toString());
          } else if (localStorageUserType) {
            // Fallback to localStorage user type if no match in profiles table
            setUserType(localStorageUserType);
          }
        } else if (localStorageAuth && localStorageUserType && localStorageEmail) {
          // Se não tem sessão Supabase, mas tem localStorage válido
          // Tenta validar o tipo de usuário com base no email armazenado
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.id) {
            const { data: profileInfo, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle();
              
            if (error) {
              console.error('Error validating localStorage user:', error);
              setUserType(localStorageUserType); // Mantém o tipo armazenado
            } else if (profileInfo) {
              const userTypeMapping: Record<string, string> = {
                'doctor': 'medico',
                'patient': 'paciente',
                'system_admin': 'admin_clinica'
              };
              const mappedUserType = userTypeMapping[profileInfo.role] || 'paciente';
              setUserType(mappedUserType);
              
              // Atualiza o tipo de usuário se for diferente
              if (mappedUserType !== localStorageUserType) {
                localStorage.setItem('userType', mappedUserType);
              }
            } else {
              // Se não encontrou o usuário, usa o tipo do localStorage
              setUserType(localStorageUserType);
            }
          } else {
            setUserType(localStorageUserType);
          }
        } else {
          setUserType(localStorageUserType);
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
    // Show toast only once per session
    const toastKey = `toast-shown-auth-${Date.now()}`;
    if (typeof window !== 'undefined' && !sessionStorage.getItem('toast-shown-auth')) {
      toast({
        variant: "destructive",
        title: "Acesso restrito",
        description: "Redirecionando para a página inicial...",
      });
      sessionStorage.setItem('toast-shown-auth', 'true');
    }
    return <Navigate to="/" />;
  }

  if (userType && !allowedUserTypes.includes(userType)) {
    // Show toast only once per session
    if (typeof window !== 'undefined' && !sessionStorage.getItem('toast-shown-perm')) {
      toast({
        variant: "destructive", 
        title: "Acesso não autorizado",
        description: "Redirecionando para sua área correta...",
      });
      sessionStorage.setItem('toast-shown-perm', 'true');
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
