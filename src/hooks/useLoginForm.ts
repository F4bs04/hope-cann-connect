// Temporarily disabled hook
export interface LoginFormValues {
  email: string;
  password: string;
}

export const useLoginForm = () => {
  return { 
    handleLogin: () => Promise.resolve({ success: false }),
    isLoading: false,
    error: null,
    form: {
      watch: () => ({ email: '', password: '' }),
      handleSubmit: (fn: any) => (e: any) => e.preventDefault(),
      formState: { errors: {} },
      register: () => ({})
    }
  };
};