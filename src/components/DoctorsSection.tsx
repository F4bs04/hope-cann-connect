
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Clock } from 'lucide-react';

// Doctor type definition
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  availability: string[];
}

const DoctorCard = ({ id, name, specialty, bio, image, availability }: Doctor) => {
  const getAvailabilityText = (availabilityArray: string[]) => {
    if (availabilityArray.includes('today')) {
      return 'Disponível hoje';
    } else if (availabilityArray.includes('this-week')) {
      return 'Disponível esta semana';
    } else {
      return 'Disponível próxima semana';
    }
  };
  
  const getAvailabilityColor = (availabilityArray: string[]) => {
    if (availabilityArray.includes('today')) {
      return 'text-green-600 bg-green-50';
    } else if (availabilityArray.includes('this-week')) {
      return 'text-blue-600 bg-blue-50';
    } else {
      return 'text-orange-600 bg-orange-50';
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="h-52 relative overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getAvailabilityColor(availability)}`}>
            <Clock size={14} />
            {getAvailabilityText(availability)}
          </span>
        </div>
      </div>
      <CardContent className="flex-grow pt-6">
        <h3 className="text-xl font-semibold mb-1">{name}</h3>
        <p className="text-hopecann-teal mb-3">{specialty}</p>
        <p className="text-gray-600 mb-4 line-clamp-3">{bio}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Link 
          to={`/medico/${id}`}
          className="block w-full py-2 px-4 bg-hopecann-teal hover:bg-hopecann-teal/90 text-white text-center rounded-md transition-colors"
        >
          Ver Perfil
        </Link>
      </CardFooter>
    </Card>
  );
};

const DoctorsSection = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('medicos')
          .select('*')
          .eq('status_disponibilidade', true)
          .limit(3);
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Process doctor data
          const doctorsWithAvailability = await Promise.all(data.map(async (doctor) => {
            // Check for the nearest available appointment
            const { data: appointmentData } = await supabase
              .from('consultas')
              .select('data_hora')
              .eq('id_medico', doctor.id)
              .eq('status', 'agendada')
              .gte('data_hora', new Date().toISOString())
              .order('data_hora', { ascending: true })
              .limit(1);
            
            let availability = ['next-week']; // Default to next week
            
            if (appointmentData && appointmentData.length > 0) {
              const appointmentDate = new Date(appointmentData[0].data_hora);
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              // Check if appointment is today
              if (appointmentDate.toDateString() === today.toDateString()) {
                availability = ['today', 'this-week'];
              } 
              // Check if appointment is this week
              else if (appointmentDate <= new Date(today.setDate(today.getDate() + 7))) {
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
        } else {
          // Use fallback data if no doctors are found
          setDoctors([
            {
              id: 1,
              name: "Dr. Ricardo Silva",
              specialty: "Neurologista",
              bio: "Especialista em tratamentos canábicos para distúrbios neurológicos.",
              image: `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`,
              availability: ['today', 'this-week']
            },
            {
              id: 2,
              name: "Dra. Ana Santos",
              specialty: "Psiquiatra",
              bio: "Especializada em tratamentos para ansiedade e depressão com abordagem integrativa.",
              image: `/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png`,
              availability: ['this-week']
            },
            {
              id: 3,
              name: "Dr. Carlos Mendes",
              specialty: "Neurologista",
              bio: "Especialista em epilepsia e doenças neurodegenerativas, com foco em tratamentos inovadores.",
              image: `/lovable-uploads/8e0e4c0d-f012-449c-9784-9be7170458f5.png`,
              availability: ['next-week']
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast({
          title: "Erro ao carregar médicos",
          description: "Não foi possível carregar a lista de médicos. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
        
        // Use fallback data
        setDoctors([
          {
            id: 1,
            name: "Dr. Ricardo Silva",
            specialty: "Neurologista",
            bio: "Especialista em tratamentos canábicos para distúrbios neurológicos.",
            image: `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`,
            availability: ['today', 'this-week']
          },
          {
            id: 2,
            name: "Dra. Ana Santos",
            specialty: "Psiquiatra",
            bio: "Especializada em tratamentos para ansiedade e depressão com abordagem integrativa.",
            image: `/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png`,
            availability: ['this-week']
          },
          {
            id: 3,
            name: "Dr. Carlos Mendes",
            specialty: "Neurologista",
            bio: "Especialista em epilepsia e doenças neurodegenerativas, com foco em tratamentos inovadores.",
            image: `/lovable-uploads/8e0e4c0d-f012-449c-9784-9be7170458f5.png`,
            availability: ['next-week']
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [toast]);

  return (
    <section className="hopecann-section py-16 md:py-24">
      <div className="hopecann-container">
        <h2 className="hopecann-section-title">Nossa Equipe Médica</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hopecann-teal"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  id={doctor.id}
                  name={doctor.name}
                  specialty={doctor.specialty}
                  bio={doctor.bio}
                  image={doctor.image}
                  availability={doctor.availability}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">Nenhum médico disponível no momento.</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link
            to="/medicos"
            className="inline-flex items-center justify-center rounded-full bg-white border border-hopecann-teal text-hopecann-teal px-6 py-3 hover:bg-hopecann-teal/5 transition-colors"
          >
            Ver todos os médicos
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;
