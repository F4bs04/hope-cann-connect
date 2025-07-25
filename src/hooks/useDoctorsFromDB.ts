import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Doctor } from '@/components/doctors/DoctorCard';
import { processDoctorData } from '@/utils/doctorDataUtils';

/**
 * Hook to fetch doctors directly from the database
 */
export const useDoctorsFromDB = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: doctorsData, error: fetchError } = await supabase
          .from('doctors')
          .select(`
            id,
            user_id,
            crm,
            specialty,
            biography,
            consultation_fee,
            is_available,
            is_approved,
            profiles!inner(full_name, email, phone, avatar_url)
          `)
          .eq('is_approved', true)
          .eq('is_available', true);

        if (fetchError) {
          console.error('Error fetching doctors:', fetchError);
          setError('Erro ao buscar médicos');
          return;
        }

        if (!doctorsData || doctorsData.length === 0) {
          console.log('No approved doctors found in database');
          setDoctors([]);
          return;
        }

        // Process each doctor to add availability information
        const processedDoctors = await Promise.all(
          doctorsData.map(doctor => processDoctorData(doctor))
        );

        setDoctors(processedDoctors);
        console.log(`Successfully loaded ${processedDoctors.length} doctors from database`);

      } catch (error) {
        console.error('Error in fetchDoctors:', error);
        setError('Erro ao buscar médicos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return { doctors, isLoading, error };
};