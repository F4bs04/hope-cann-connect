// This hook is temporarily disabled due to database schema updates
export const useAuth = () => {
  return {
    isLoading: false,
    user: null,
    signOut: () => {},
    signIn: () => {},
    error: null
  };
};