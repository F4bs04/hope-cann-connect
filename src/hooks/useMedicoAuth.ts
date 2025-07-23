
import { useUnifiedAuth } from './useUnifiedAuth';

/**
 * @deprecated Use useUnifiedAuth instead
 * Hook legado mantido apenas para compatibilidade
 */
export function useMedicoAuth() {
  const auth = useUnifiedAuth();
  
  return {
    isAuthenticated: auth.isAuthenticated && auth.isMedico,
    isMedico: auth.isMedico,
    medicoId: auth.medicoId,
    isApproved: auth.isApproved,
    permissions: ['dashboard', 'agenda', 'pacientes', 'receitas'],
    isLoading: auth.isLoading,
    hasPermission: auth.hasPermission,
    requireApproval: auth.requireApproval
  };
}
