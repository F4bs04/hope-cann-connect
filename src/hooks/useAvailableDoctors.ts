
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { processDoctorData } from '@/utils/doctorDataUtils';
import { Doctor } from '@/components/doctors/DoctorCard';

/**
 * Hook for fetching available doctors from the database
 */
export const useAvailableDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<{success: boolean, message: string}>({
    success: true,
    message: ''
  });
  
  useEffect(() => {
    const fetchAvailableDoctors = async () => {
      try {
        // Buscando médicos disponíveis
        const { data, error } = await supabase
          .from('medicos')
          .select('*')
          .eq('status_disponibilidade', true)
          .limit(3);
          
        if (error) {
          console.error('Error fetching available doctors:', error);
          setStatus({
            success: false,
            message: `Erro ao consultar médicos disponíveis: ${error.message}`
          });
          throw error;
        }
        
        console.log(`Médicos disponíveis: ${data?.length || 0}`);
        
        if (data && data.length > 0) {
          console.log("Médicos disponíveis encontrados:", data);
          // Process doctor data
          const doctorsWithAvailability = await Promise.all(data.map(processDoctorData));
          
          setDoctors(doctorsWithAvailability);
          setStatus({
            success: true,
            message: `${doctorsWithAvailability.length} médicos disponíveis encontrados`
          });
        } else {
          setStatus({
            success: false,
            message: 'Nenhum médico disponível encontrado (status_disponibilidade = true)'
          });
        }
      } catch (error) {
        console.error('Error in useAvailableDoctors:', error);
        setStatus({
          success: false,
          message: `Erro ao buscar médicos disponíveis: ${error}`
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAvailableDoctors();
  }, []);
  
  return { doctors, isLoading, status };
};
