
import { Doctor } from '@/components/doctors/DoctorCard';
import { supabase } from "@/integrations/supabase/client";

/**
 * Processes a raw doctor record from the database into a standardized Doctor object
 */
export const processDoctorData = async (doctor: any): Promise<Doctor> => {
  // Check for the nearest available appointment
  const { data: appointmentData, error: appointmentError } = await supabase
    .from('consultas')
    .select('data_hora')
    .eq('id_medico', doctor.id)
    .eq('status', 'agendada')
    .gte('data_hora', new Date().toISOString())
    .order('data_hora', { ascending: true })
    .limit(1);
  
  if (appointmentError) {
    console.error('Error fetching appointments:', appointmentError);
  }
  
  let availability = ['next-week']; // Default to next week
  
  if (appointmentData && appointmentData.length > 0) {
    const appointmentDate = new Date(appointmentData[0].data_hora);
    const today = new Date();
    const thisWeekEnd = new Date(today);
    thisWeekEnd.setDate(today.getDate() + 7);
    
    // Check if appointment is today
    if (appointmentDate.toDateString() === today.toDateString()) {
      availability = ['today', 'this-week'];
    } 
    // Check if appointment is this week
    else if (appointmentDate <= thisWeekEnd) {
      availability = ['this-week'];
    }
  }
  
  return {
    id: doctor.id,
    name: doctor.nome,
    specialty: doctor.especialidade,
    bio: doctor.biografia || 'Especialista em tratamentos canábicos.',
    image: doctor.foto_perfil || `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`,
    availability
  };
};

/**
 * Creates default fallback doctors when no doctors are found in the database
 */
export const createFallbackDoctors = (): Doctor[] => {
  return [{
    id: 1,
    name: "Dr. Ricardo Silva",
    specialty: "Neurologista",
    bio: "Especialista em tratamentos canábicos para distúrbios neurológicos.",
    image: `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`,
    availability: ['today', 'this-week']
  }, {
    id: 2,
    name: "Dra. Ana Santos",
    specialty: "Psiquiatra",
    bio: "Especializada em tratamentos para ansiedade e depressão com abordagem integrativa.",
    image: `/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png`,
    availability: ['this-week']
  }, {
    id: 3,
    name: "Dr. Carlos Mendes",
    specialty: "Neurologista",
    bio: "Especialista em epilepsia e doenças neurodegenerativas, com foco em tratamentos inovadores.",
    image: `/lovable-uploads/8e0e4c0d-f012-449c-9784-9be7170458f5.png`,
    availability: ['next-week']
  }];
};
