
import { useState, useEffect } from 'react';
import { Doctor } from '@/components/doctors/DoctorCard';
import { processDoctorData } from '@/utils/doctorDataUtils';

/**
 * Hook for matching user accounts with doctor profiles
 */
export const useUserDoctorMatching = (userDoctors: any[] = [], allDoctors: any[] = []) => {
  const [matchedDoctors, setMatchedDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<{success: boolean, message: string}>({
    success: true,
    message: ''
  });
  
  useEffect(() => {
    const matchDoctorsWithUsers = async () => {
      try {
        setIsLoading(true);
        let doctorsList: Doctor[] = [];
        
        if (userDoctors.length > 0 && allDoctors.length > 0) {
          for (const userDoctor of userDoctors) {
            const matchingDoctor = allDoctors.find(doc => doc.id_usuario === userDoctor.id);
            if (matchingDoctor) {
              console.log(`Médico correspondente encontrado para usuário ID ${userDoctor.id}:`, matchingDoctor);
              
              // Process doctor data with user connection
              const doctorWithAvailability = await processDoctorData(matchingDoctor);
              doctorsList.push(doctorWithAvailability);
            } else {
              console.log(`Nenhum médico correspondente para o usuário ID ${userDoctor.id}`);
            }
          }
        }
        
        if (doctorsList.length > 0) {
          console.log(`${doctorsList.length} médicos encontrados com relacionamento usuário/médico`);
          setMatchedDoctors(doctorsList);
          setStatus({
            success: true,
            message: `${doctorsList.length} médicos encontrados relacionando usuários e médicos`
          });
        } else {
          setStatus({
            success: false,
            message: 'Nenhum médico encontrado com relação a usuários'
          });
        }
      } catch (error) {
        console.error('Error matching doctors with users:', error);
        setStatus({
          success: false,
          message: `Erro ao relacionar médicos com usuários: ${error}`
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userDoctors.length > 0 || allDoctors.length > 0) {
      matchDoctorsWithUsers();
    } else {
      setIsLoading(false);
    }
  }, [userDoctors, allDoctors]);
  
  return { matchedDoctors, isLoading, status };
};
