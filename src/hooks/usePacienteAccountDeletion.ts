// Temporarily disabled hook
export const usePacienteAccountDeletion = () => {
  return { 
    isLoading: false,
    error: null,
    deleteAccount: () => Promise.resolve({ success: false })
  };
};