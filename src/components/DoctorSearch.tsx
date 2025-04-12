
import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const DoctorSearch = ({ onSelectDoctor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch doctors from Supabase
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('medicos')
          .select('*')
          .eq('status_disponibilidade', true);
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Check for doctor availability from consultas table
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
          setFilteredDoctors(doctorsWithAvailability);
          
          // Extract unique specialties for filtering
          const uniqueSpecialties = [...new Set(data.map(doctor => doctor.especialidade))];
          setSpecialties(uniqueSpecialties);
        } else {
          // Fallback to empty arrays
          setDoctors([]);
          setFilteredDoctors([]);
          setSpecialties([]);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast({
          title: "Erro ao carregar médicos",
          description: "Não foi possível carregar a lista de médicos. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
        
        // Fallback to empty arrays
        setDoctors([]);
        setFilteredDoctors([]);
        setSpecialties([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [toast]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterDoctors(term, selectedSpecialty);
  };

  const handleSpecialtyFilter = (specialty) => {
    setSelectedSpecialty(specialty);
    filterDoctors(searchTerm, specialty);
  };

  const filterDoctors = (term, specialty) => {
    let filtered = doctors;
    
    if (term) {
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(term.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    if (specialty) {
      filtered = filtered.filter(doctor => doctor.specialty === specialty);
    }
    
    setFilteredDoctors(filtered);
  };

  const getAvailabilityText = (availabilityArray) => {
    if (availabilityArray.includes('today')) {
      return 'Disponível hoje';
    } else if (availabilityArray.includes('this-week')) {
      return 'Disponível esta semana';
    } else {
      return 'Disponível próxima semana';
    }
  };
  
  const getAvailabilityColor = (availabilityArray) => {
    if (availabilityArray.includes('today')) {
      return 'text-green-600 bg-green-50';
    } else if (availabilityArray.includes('this-week')) {
      return 'text-blue-600 bg-blue-50';
    } else {
      return 'text-orange-600 bg-orange-50';
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar médico por nome ou especialidade..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="flex-shrink-0 flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedSpecialty === '' 
                ? 'bg-hopecann-teal text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleSpecialtyFilter('')}
          >
            Todos
          </button>
          
          {specialties.map(specialty => (
            <button
              key={specialty}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedSpecialty === specialty 
                  ? 'bg-hopecann-teal text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleSpecialtyFilter(specialty)}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hopecann-teal"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDoctors.map(doctor => (
              <div
                key={doctor.id}
                className="p-4 border rounded-lg cursor-pointer transition-colors border-gray-200 hover:border-hopecann-teal/50"
                onClick={() => onSelectDoctor(doctor.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <img 
                      src={doctor.image} 
                      alt={doctor.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{doctor.name}</h3>
                        <p className="text-sm text-hopecann-teal mb-1">{doctor.specialty}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getAvailabilityColor(doctor.availability)}`}>
                        <Clock size={12} />
                        {getAvailabilityText(doctor.availability)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredDoctors.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum médico encontrado com os critérios de busca.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorSearch;
