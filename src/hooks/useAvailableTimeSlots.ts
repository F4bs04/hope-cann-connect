// Temporarily disabled hook
export const useAvailableTimeSlots = (doctorId?: string, selectedDate?: Date) => {
  return { 
    timeSlots: [], 
    loading: false, 
    error: null,
    refresh: () => {}
  };
};