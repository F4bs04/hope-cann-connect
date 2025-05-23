export const getAvailabilityText = (availabilityArray: string[]) => {
  if (availabilityArray.includes('today')) {
    return 'Disponível hoje';
  } else if (availabilityArray.includes('this-week')) {
    return 'Disponível esta semana';
  } else {
    return 'Disponível próxima semana';
  }
};

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
 * Calculate availability based on the next appointment date
 * @param appointmentDate - The date of the next appointment or null if no appointment
 * @returns An array of availability strings: 'today', 'this-week', or 'next-week'
 */
export const calculateAvailability = (appointmentDate: Date | null): string[] => {
  if (!appointmentDate) {
    return ['next-week']; // Default to next week if no appointment
  }
  
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
  // Otherwise it's next week or beyond
  else {
    return ['next-week'];
  }
};
