
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
        // Buscando médicos aprovados da tabela doctors
        const { data, error } = await supabase
          .from('public_doctors')
          .select(`
            doctor_id,
            doctor_name,
            specialty,
            consultation_fee,
            is_available,
            is_approved,
            avatar_url
          `)
          .eq('is_approved', true)
          .eq('is_available', true)
          .limit(10);
          
        if (error) {
          console.error('Error fetching available doctors:', error);
          setStatus({
            success: false,
            message: `Erro ao consultar médicos disponíveis: ${error.message}`
          });
          throw error;
        }
        
        console.log(`Médicos encontrados: ${data?.length || 0}`);
        
        if (data && data.length > 0) {
          console.log("Médicos encontrados:", data);
          // Process doctor data
          const doctorsWithAvailability = await Promise.all(data.map(processDoctorData));
          
          setDoctors(doctorsWithAvailability);
          setStatus({
            success: true,
            message: `${doctorsWithAvailability.length} médicos encontrados`
          });
        } else {
          console.log("Nenhum médico encontrado no banco de dados");
          setStatus({
            success: false,
            message: 'Nenhum médico encontrado no banco de dados'
          });
        }
      } catch (error) {
        console.error('Error in useAvailableDoctors:', error);
        setStatus({
          success: false,
          message: `Erro ao buscar médicos: ${error}`
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAvailableDoctors();
  }, []);
  
  return { doctors, isLoading, status };
};
