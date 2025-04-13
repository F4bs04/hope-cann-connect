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
