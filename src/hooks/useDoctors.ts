
import { useDoctorsFromDB } from './useDoctorsFromDB';

/**
 * Primary hook for fetching and providing doctor data from database
 */
export const useDoctors = () => {
  const { doctors, isLoading, error } = useDoctorsFromDB();
  
  const dbStatus = {
    success: !error && doctors.length > 0,
    message: error || (doctors.length === 0 ? 'Nenhum médico encontrado' : 'Médicos carregados com sucesso')
  };
  
  return { doctors, isLoading, dbStatus };
};
