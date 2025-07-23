
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userProfile: any;
  userType: string | null;
  hasPermission: (permission: string) => boolean;
  requireApproval: () => boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  
  const {
    isAuthenticated,
    isLoading,
    userProfile,
    isApproved,
    initialize,
    login: authLogin,
    logout: authLogout,
    hasPermission,
    getUserType,
    getCorrectPath,
  } = useAuthStore();

  // Inicializar autenticação apenas uma vez
  useEffect(() => {
    console.log("[AuthContext] Tentando inicializar...", { initialized, isLoading });
    if (!initialized && !isLoading) {
      console.log("[AuthContext] Inicializando autenticação pela primeira vez...");
      setInitialized(true);
      initialize();
    }
  }, []);

  // Redirecionamento apenas após inicialização completa
  useEffect(() => {
    if (initialized && !isLoading && isAuthenticated && userProfile) {
      const currentPath = window.location.pathname;
      const correctPath = getCorrectPath();
      
      // Apenas redirecionar se estiver na página de login
      if (currentPath === '/login' && correctPath !== '/login') {
        console.log("[AuthContext] Redirecionando para:", correctPath);
        navigate(correctPath, { replace: true });
      }
    }
  }, [initialized, isAuthenticated, userProfile, isLoading, navigate, getCorrectPath]);

  const login = async (email: string, password: string) => {
    const result = await authLogin(email, password);
    
    if (result.success) {
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao sistema!",
      });
    } else {
      toast({
        title: "Erro ao fazer login",
        description: result.error || "Tente novamente.",
        variant: "destructive",
      });
    }
    
    return result;
  };

  const logout = async () => {
    await authLogout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    navigate('/login');
  };

  const requireApproval = () => {
    if (!isApproved) {
      toast({
        title: "Acesso restrito",
        description: "Esta funcionalidade requer aprovação da conta.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading: isLoading || !initialized,
    userProfile,
    userType: getUserType(),
    hasPermission,
    requireApproval,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
