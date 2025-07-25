
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches doctors from the database or uses fallback data if not available
 */
export const fetchDoctors = async ({ setDoctors, setIsLoading, setDbStatus, toast }) => {
  try {
    setIsLoading(true);
    console.log("Fetching doctors for scheduling from Supabase...");
    
    const { data, error } = await supabase
      .from('doctors')
      .select('id, user_id, specialty, biography, is_approved, created_at, profiles!inner(full_name, avatar_url)');
      
    if (error) {
      console.error('Error fetching doctors:', error);
      setDbStatus({
        success: false,
        message: `Erro ao buscar médicos: ${error.message}`
      });
      throw error;
    }
    
    console.log(`Total de médicos encontrados: ${data?.length || 0}`);
    
    if (data && data.length > 0) {
      console.log("Médicos encontrados:", data);
      
      const doctorsWithAvailability = data.map(doctor => {
        const availability = ['next-week'];
        
        return {
          id: doctor.id,
          name: doctor.profiles?.full_name || 'Nome não disponível',
          specialty: doctor.specialty || "Medicina Canábica",
          bio: doctor.biography || 'Especialista em tratamentos canábicos.',
          image: doctor.profiles?.avatar_url || `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`,
          availability
        };
      });
      
      setDoctors(doctorsWithAvailability);
      setDbStatus({
        success: true,
        message: `${doctorsWithAvailability.length} médicos encontrados`
      });
    } else {
      console.log("Nenhum médico encontrado, usando dados de fallback");
      setDbStatus({
        success: false,
        message: 'Nenhum médico encontrado na tabela medicos'
      });
      
      setDoctors([{
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
      }]);
    }
  } catch (error) {
    console.error('Error in fetchDoctors:', error);
    toast({
      title: "Erro ao carregar médicos",
      description: "Não foi possível carregar a lista de médicos. Por favor, tente novamente mais tarde.",
      variant: "destructive"
    });

    setDoctors([{
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
    }]);
  } finally {
    setIsLoading(false);
  }
};
