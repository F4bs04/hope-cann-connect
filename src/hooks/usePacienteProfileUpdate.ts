// Temporarily disabled hook
export const usePacienteProfileUpdate = () => {
  return { 
    isLoading: false,
    error: null,
    updateProfile: () => Promise.resolve({ success: false }),
    submitProfileUpdate: () => Promise.resolve({ success: false })
  };
};