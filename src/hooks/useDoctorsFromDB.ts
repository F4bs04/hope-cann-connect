import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Doctor } from '@/components/doctors/DoctorCard';

/**
 * Hook to fetch doctors for public display from the public_doctors view
 */
export const useDoctorsFromDB = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        console.log('Fetching public doctors for homepage...');

        const { data, error: fetchError } = await supabase
          .from('public_doctors')
          .select('doctor_id, doctor_name, avatar_url, specialty, consultation_fee, is_available, is_approved')
          .eq('is_approved', true)
          .eq('is_available', true);

        if (fetchError) {
          console.error('Error fetching public doctors:', fetchError);
          setError('Erro ao buscar médicos');
          return;
        }

        if (!data || data.length === 0) {
          console.log('No approved/available doctors in public view');
          setDoctors([]);
          return;
        }

        const mapped: Doctor[] = data.map((d: any) => ({
          id: d.doctor_id,
          name: d.doctor_name || 'Médico',
          specialty: d.specialty || 'Medicina Canábica',
          bio: 'Especialista em tratamentos canábicos.',
          image: d.avatar_url || '/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png',
          availability: ['this-week'],
          consultationFee: d.consultation_fee ? Number(d.consultation_fee) : undefined,
        }));

        setDoctors(mapped);
        console.log(`Loaded ${mapped.length} doctors from public_doctors`);
      } catch (err) {
        console.error('Error in fetchDoctors:', err);
        setError('Erro ao buscar médicos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return { doctors, isLoading, error };
};