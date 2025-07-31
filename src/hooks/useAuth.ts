import { useAuthStore } from '@/store/authStore';

/**
 * Hook de autenticação que usa o AuthStore centralizado do Supabase
 * Mantém compatibilidade com componentes existentes
 */
export const useAuth = () => {
  const {
    isAuthenticated,
    isLoading,
    userProfile,
    session,
    user,
    medicoId,
    pacienteId,
    clinicaId,
    isApproved,
    permissions,
    login,
    logout,
    hasPermission,
    getUserType
  } = useAuthStore();

  return {
    // Compatibilidade com interface antiga
    isLoading,
    user,
    userData: userProfile, // Mapear userData para userProfile
    userType: getUserType(),
    userProfile,
    
    // Estados de autenticação
    isAuthenticated,
    session,
    
    // IDs específicos por tipo
    medicoId,
    pacienteId, 
    clinicaId,
    
    // Status e permissões
    isApproved,
    permissions,
    hasPermission,
    
    // Ações
    signIn: login, // Mapear signIn para login
    signOut: logout, // Mapear signOut para logout
    login,
    logout,
    
    // Sem erros por enquanto (pode ser expandido)
    error: null
  };
};