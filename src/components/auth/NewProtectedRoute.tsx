import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: string[];
  requireApproval?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedUserTypes = [], 
  requireApproval = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, userType, requireApproval: checkApproval } = useAuth();
  const { toast } = useToast();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  // Não autenticado
  if (!isAuthenticated) {
    toast({
      variant: "destructive",
      title: "Acesso restrito",
      description: "Faça login para acessar esta página.",
    });
    return <Navigate to="/login" replace />;
  }

  // Verificar se o tipo de usuário tem permissão
  if (allowedUserTypes.length > 0 && userType && !allowedUserTypes.includes(userType)) {
    toast({
      variant: "destructive",
      title: "Acesso não autorizado",
      description: "Você não tem permissão para acessar esta página.",
    });
    
    // Redirecionar para a área apropriada
    const redirectPath = userType === 'medico' ? '/area-medico' :
                        userType === 'paciente' ? '/area-paciente' :
                        userType === 'admin_clinica' ? '/admin' : '/';
    
    return <Navigate to={redirectPath} replace />;
  }

  // Verificar aprovação se necessário
  if (requireApproval && !checkApproval()) {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
}