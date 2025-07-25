// Temporarily disabled hook
export const useHorariosValidation = () => {
  return { 
    validateHorario: () => true,
    hasConflict: () => false,
    isLoading: false
  };
};