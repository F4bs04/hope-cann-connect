
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SearchBar from './doctor/SearchBar';
import SpecialtyFilter from './doctor/SpecialtyFilter';
import DoctorList from './doctor/DoctorList';
import { Doctor } from './doctor/DoctorCard';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DoctorSearchProps {
  onSelectDoctor: (id: number) => void;
}

const DoctorSearch = ({ onSelectDoctor }: DoctorSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
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
          setFilteredDoctors(doctorsWithAvailability);
          
          // Extract unique specialties for filtering
          const uniqueSpecialties = [...new Set(data.map(doctor => doctor.especialidade))];
          setSpecialties(uniqueSpecialties);
        } else {
          // Fallback to empty arrays if no data
          console.log("No doctors found in database");
          toast({
            title: "Nenhum médico encontrado",
            description: "Não há médicos disponíveis no momento.",
          });
          setDoctors([]);
          setFilteredDoctors([]);
        }
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterDoctors(term, selectedSpecialty);
  };

  const handleSpecialtyFilter = (specialty: string) => {
    setSelectedSpecialty(specialty);
    filterDoctors(searchTerm, specialty);
  };

  const filterDoctors = (term: string, specialty: string) => {
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

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    filterDoctors('', '');
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex w-full gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar médico por nome ou especialidade..."
              className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button 
            className="bg-[#00BCD4] hover:bg-[#00BCD4]/90 text-white rounded-full px-6"
          >
            Todos
          </Button>
        </div>
      </div>
      
      <DoctorList 
        doctors={filteredDoctors} 
        isLoading={isLoading} 
        onSelectDoctor={onSelectDoctor}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
};

export default DoctorSearch;
