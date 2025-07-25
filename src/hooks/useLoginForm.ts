// Temporarily disabled hook
export interface LoginFormValues {
  email: string;
  password: string;
}

export const useLoginForm = () => {
  return { 
    handleLogin: () => Promise.resolve({ success: false }),
    isLoading: false,
    error: null
  };
};