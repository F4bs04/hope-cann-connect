
/**
 * Generates a list of available days for consultation
 * Excludes weekends (Saturday and Sunday)
 * 
 * @returns Array of Date objects for available days
 */
export const generateAvailableDays = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days.push(date);
    }
  }
  
  return days;
};
