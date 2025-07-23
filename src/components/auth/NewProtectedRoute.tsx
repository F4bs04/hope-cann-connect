import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/loading-spinner';

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

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  // Não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se o tipo de usuário tem permissão
  if (allowedUserTypes.length > 0 && userType && !allowedUserTypes.includes(userType)) {
    // Redirecionar para a área apropriada, mas evitar loops
    const currentPath = window.location.pathname;
    const redirectPath = userType === 'medico' ? '/area-medico' :
                        userType === 'paciente' ? '/area-paciente' :
                        userType === 'admin_clinica' ? '/admin' : '/';
    
    // Só redirecionar se não estivermos já no caminho correto
    if (!currentPath.startsWith(redirectPath)) {
      return <Navigate to={redirectPath} replace />;
    }
  }

  // Verificar aprovação se necessário
  if (requireApproval && !checkApproval()) {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
}