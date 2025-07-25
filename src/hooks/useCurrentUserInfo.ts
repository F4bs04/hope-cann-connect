// Temporarily disabled hook
export const useCurrentUserInfo = () => {
  return { 
    userInfo: { medicoId: null }, 
    loading: false,
    isLoading: false, 
    error: null 
  };
};