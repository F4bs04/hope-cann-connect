
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

  // Inicializar apenas uma vez quando o componente monta
  useEffect(() => {
    let isMounted = true;
    console.log("[AuthContext] Montando AuthProvider, iniciando inicialização...");
    
    const initializeAuth = async () => {
      if (isMounted) {
        await initialize();
      }
    };
    
    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, []); // Array vazio é correto aqui - queremos que rode apenas uma vez

  // Redirecionamento após login bem-sucedido
  useEffect(() => {
    if (!isLoading && isAuthenticated && userProfile) {
      const currentPath = window.location.pathname;
      const correctPath = getCorrectPath();
      
      // Verificar se é um fluxo de recuperação de senha
      const urlParams = new URLSearchParams(window.location.search);
      const isPasswordRecovery = urlParams.get('type') === 'recovery' || 
                                 currentPath === '/redefinir-senha' ||
                                 urlParams.has('access_token');
      
      // Não redirecionar durante fluxo de recuperação de senha
      if (isPasswordRecovery) {
        console.log("[AuthContext] Fluxo de recuperação de senha detectado, não redirecionando");
        return;
      }
      
      // Apenas redirecionar se estiver na página de login
      // NÃO redirecionar da home page (/) - permitir que usuário escolha onde ir
      if (currentPath === '/login' && correctPath !== '/login') {
        console.log("[AuthContext] Redirecionando para:", correctPath);
        navigate(correctPath, { replace: true });
      }
    }
  }, [isAuthenticated, userProfile, isLoading, navigate, getCorrectPath]);

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
    isLoading,
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
