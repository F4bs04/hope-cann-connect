
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Doctor } from '@/components/doctors/DoctorCard';

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{success: boolean, message: string}>({
    success: true,
    message: ''
  });
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching doctors from Supabase...");
        
        // 1. Primeiro, verificando usuários do tipo médico na tabela 'usuarios'
        const { data: userDoctors, error: userDoctorsError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('tipo_usuario', 'medico');
        
        if (userDoctorsError) {
          console.error('Error fetching doctor users:', userDoctorsError);
          setDbStatus({
            success: false,
            message: `Erro ao consultar usuários médicos: ${userDoctorsError.message}`
          });
        } else {
          console.log(`Total de usuários médicos no banco: ${userDoctors?.length || 0}`);
          if (userDoctors && userDoctors.length > 0) {
            console.log("Usuários médicos encontrados:", userDoctors);
          } else {
            console.log("Nenhum usuário médico encontrado na tabela");
          }
        }
        
        // 2. Verificando todos os médicos na tabela 'medicos' para diagnóstico
        const { data: allDoctors, error: allDoctorsError } = await supabase
          .from('medicos')
          .select('*');
        
        if (allDoctorsError) {
          console.error('Error fetching all doctors:', allDoctorsError);
          setDbStatus({
            success: false,
            message: `Erro ao consultar todos os médicos: ${allDoctorsError.message}`
          });
        } else {
          console.log(`Total de médicos no banco: ${allDoctors?.length || 0}`);
          if (allDoctors && allDoctors.length > 0) {
            console.log("Médicos encontrados (todos):", allDoctors);
          } else {
            console.log("Nenhum médico encontrado na tabela");
            setDbStatus({
              success: false,
              message: 'Nenhum médico encontrado na tabela'
            });
          }
        }
        
        // 3. Tentativa de relacionar usuários médicos com a tabela de médicos
        let doctorsList = [];
        
        if (userDoctors && userDoctors.length > 0 && allDoctors && allDoctors.length > 0) {
          for (const userDoctor of userDoctors) {
            const matchingDoctor = allDoctors.find(doc => doc.id_usuario === userDoctor.id);
            if (matchingDoctor) {
              console.log(`Médico correspondente encontrado para usuário ID ${userDoctor.id}:`, matchingDoctor);
              
              // Process doctor data with user connection
              const doctorWithAvailability = {
                id: matchingDoctor.id,
                name: matchingDoctor.nome || `Dr. ${userDoctor.email.split('@')[0]}`,
                specialty: matchingDoctor.especialidade || "Medicina Canábica",
                bio: matchingDoctor.biografia || 'Especialista em tratamentos canábicos.',
                image: matchingDoctor.foto_perfil || `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`,
                availability: ['next-week'] // Default availability
              };
              
              doctorsList.push(doctorWithAvailability);
            } else {
              console.log(`Nenhum médico correspondente para o usuário ID ${userDoctor.id}`);
            }
          }
        }
        
        if (doctorsList.length > 0) {
          console.log(`${doctorsList.length} médicos encontrados com relacionamento usuário/médico`);
          setDoctors(doctorsList);
          setDbStatus({
            success: true,
            message: `${doctorsList.length} médicos encontrados relacionando usuários e médicos`
          });
        } else {
          // Buscando médicos disponíveis (original)
          const { data, error } = await supabase
            .from('medicos')
            .select('*')
            .eq('status_disponibilidade', true)
            .limit(3);
            
          if (error) {
            console.error('Error fetching available doctors:', error);
            setDbStatus({
              success: false,
              message: `Erro ao consultar médicos disponíveis: ${error.message}`
            });
            throw error;
          }
          
          console.log(`Médicos disponíveis: ${data?.length || 0}`);
          
          if (data && data.length > 0) {
            console.log("Médicos disponíveis encontrados:", data);
            // Process doctor data
            const doctorsWithAvailability = await Promise.all(data.map(async doctor => {
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
            }));
            
            setDoctors(doctorsWithAvailability);
            setDbStatus({
              success: true,
              message: `${doctorsWithAvailability.length} médicos disponíveis encontrados`
            });
          } else {
            setDbStatus({
              success: false,
              message: 'Nenhum médico disponível encontrado (status_disponibilidade = true)'
            });
            
            // Use fallback data if no doctors are found
            setDoctors([{
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
            }]);
          }
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast({
          title: "Erro ao carregar médicos",
          description: "Não foi possível carregar a lista de médicos. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });

        // Use fallback data
        setDoctors([{
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
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctors();
  }, [toast]);
  
  return { doctors, isLoading, dbStatus };
};
