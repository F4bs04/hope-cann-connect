// Temporarily disabled hook
export const useMedicoData = () => {
  return { 
    medicoProfile: null,
    isLoading: false,
    error: null,
    updateProfile: () => Promise.resolve({ success: false })
  };
};