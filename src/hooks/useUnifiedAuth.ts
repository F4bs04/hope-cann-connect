import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook unificado que substitui useAuth, useMedicoAuth, useLoginForm
 * Centraliza toda a lógica de autenticação em uma interface consistente
 */
export function useUnifiedAuth() {
  const auth = useAuthContext();
  const authStore = useAuthStore();
  
  return {
    // Estados principais
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    userProfile: auth.userProfile,
    userType: auth.userType,
    
    // Dados específicos por tipo (para compatibilidade)
    userData: auth.userProfile,
    medicoId: authStore.medicoId,
    pacienteId: authStore.pacienteId,
    isApproved: authStore.isApproved,
    
    // Ações
    login: auth.login,
    logout: auth.logout,
    
    // Helpers
    hasPermission: auth.hasPermission,
    requireApproval: auth.requireApproval,
    
    // Métodos de compatibilidade para não quebrar código existente
    isMedico: auth.userType === 'medico',
    isPaciente: auth.userType === 'paciente',
    isClinica: auth.userType === 'admin_clinica',
  };
}

// Re-exportar para compatibilidade
export const useAuth = useUnifiedAuth;
export const useMedicoAuth = useUnifiedAuth;
export const usePacienteAuth = useUnifiedAuth;