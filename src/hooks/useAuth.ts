// This hook is temporarily disabled due to database schema updates
export const useAuth = () => {
  return {
    isLoading: false,
    user: null,
    userData: null,
    userType: null,
    signOut: () => {},
    signIn: () => {},
    error: null
  };
};