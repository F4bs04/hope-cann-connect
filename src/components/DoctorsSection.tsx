
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const DoctorCard = ({ id, name, specialty, bio, image }) => {
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
      </div>
      <CardContent className="flex-grow pt-6">
        <h3 className="text-xl font-semibold mb-1">{name}</h3>
        <p className="text-hopecann-teal mb-3">{specialty}</p>
        <p className="text-gray-600 mb-4">{bio}</p>
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
  const [doctors, setDoctors] = useState([]);
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
        
        // Transform the data to match the component's expected format
        const formattedDoctors = data.map(doctor => ({
          id: doctor.id,
          name: doctor.nome,
          specialty: doctor.especialidade,
          bio: doctor.biografia || 'Especialista em tratamentos canábicos.',
          image: doctor.foto_perfil || `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`
        }));
        
        setDoctors(formattedDoctors);
        
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast({
          title: "Erro ao carregar médicos",
          description: "Não foi possível carregar a lista de médicos. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
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
