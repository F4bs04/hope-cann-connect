
/**
 * Utility functions for doctor data handling
 */

/**
 * Get the availability text based on the availability array
 */
export const getAvailabilityText = (availabilityArray: string[]) => {
  if (availabilityArray.includes('today')) {
    return 'Disponível hoje';
  } else if (availabilityArray.includes('this-week')) {
    return 'Disponível esta semana';
  } else {
    return 'Disponível próxima semana';
  }
};

/**
 * Get the CSS class for availability badge based on the availability array
 */
export const getAvailabilityColor = (availabilityArray: string[]) => {
  if (availabilityArray.includes('today')) {
    return 'text-green-600 bg-green-50';
  } else if (availabilityArray.includes('this-week')) {
    return 'text-blue-600 bg-blue-50';
  } else {
    return 'text-orange-600 bg-orange-50';
  }
};

/**
 * Calculate doctor availability based on appointment data
 */
export const calculateAvailability = (appointmentDate: Date | null): string[] => {
  if (!appointmentDate) return ['next-week'];
  
  const today = new Date();
  const thisWeekEnd = new Date(today);
  thisWeekEnd.setDate(today.getDate() + 7);
  
  // Check if appointment is today
  if (appointmentDate.toDateString() === today.toDateString()) {
    return ['today', 'this-week'];
  } 
  // Check if appointment is this week
  else if (appointmentDate <= thisWeekEnd) {
    return ['this-week'];
  }
  
  return ['next-week'];
};
