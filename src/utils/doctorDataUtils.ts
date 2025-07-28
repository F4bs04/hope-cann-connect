
import { Doctor } from '@/components/doctors/DoctorCard';
import { supabase } from "@/integrations/supabase/client";

/**
 * Processes a raw doctor record from the database into a standardized Doctor object
 */
export const processDoctorData = async (doctor: any): Promise<Doctor> => {
  // Check for the nearest available appointment using the appointments table
  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('scheduled_at')
    .eq('doctor_id', doctor.id)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1);
  
  if (appointmentError) {
    console.error('Error fetching appointments:', appointmentError);
  }
  
  let availability = ['next-week']; // Default to next week
  
  if (appointmentData && appointmentData.length > 0) {
    const appointmentDate = new Date(appointmentData[0].scheduled_at);
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
  
  // Truncar biografia se muito longa para melhor exibição
  const truncatedBio = doctor.biography && doctor.biography.length > 150 
    ? doctor.biography.substring(0, 150) + '...'
    : doctor.biography || 'Especialista em tratamentos canábicos.';

  return {
    id: doctor.id.toString(), // Convert UUID to string to match DoctorCard interface
    name: doctor.profiles?.full_name || "Médico",
    specialty: doctor.specialty || "Medicina Canábica",
    bio: truncatedBio,
    image: doctor.profiles?.avatar_url || `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`,
    availability
  };
};

/**
 * Creates default fallback doctors when no doctors are found in the database
 */
export const createFallbackDoctors = (): Doctor[] => {
  return [{
    id: "1",
    name: "Dr. Ricardo Silva",
    specialty: "Neurologista",
    bio: "Especialista em tratamentos canábicos para distúrbios neurológicos.",
    image: `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`,
    availability: ['today', 'this-week']
  }, {
    id: "2",
    name: "Dra. Ana Santos",
    specialty: "Psiquiatra",
    bio: "Especializada em tratamentos para ansiedade e depressão com abordagem integrativa.",
    image: `/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png`,
    availability: ['this-week']
  }, {
    id: "3",
    name: "Dr. Carlos Mendes",
    specialty: "Neurologista",
    bio: "Especialista em epilepsia e doenças neurodegenerativas, com foco em tratamentos inovadores.",
    image: `/lovable-uploads/8e0e4c0d-f012-449c-9784-9be7170458f5.png`,
    availability: ['next-week']
  }];
};

/**
 * Fetch doctor by ID with error handling
 */
export const fetchDoctorById = async (id: string): Promise<any> => {
  try {
    // Validar se o ID é válido antes de fazer a query
    if (!id || id === 'undefined' || id === 'null' || id === 'NaN') {
      console.error('ID inválido fornecido para fetchDoctorById:', id);
      return null;
    }

    // Validar se é um UUID válido ou número válido
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const isValidNumber = !isNaN(Number(id)) && Number(id) > 0;
    
    if (!isValidUUID && !isValidNumber) {
      console.error('Formato de ID inválido para fetchDoctorById:', id);
      return null;
    }

    // Buscar dados do médico no Supabase usando a tabela doctors
    const { data, error } = await supabase
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
      .eq('id', id)
      .maybeSingle(); // Use maybeSingle instead of single to handle case when no doctor is found
      
    if (error) {
      console.error('Error fetching doctor:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchDoctorById:', error);
    return null;
  }
};
