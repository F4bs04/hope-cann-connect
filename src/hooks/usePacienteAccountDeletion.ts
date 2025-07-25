// Temporarily disabled hook
export const usePacienteAccountDeletion = ({ paciente }: any) => {
  return { 
    isLoading: false,
    error: null,
    deleteAccount: async () => Promise.resolve({ success: false })
  };
};