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
  onSelectDoctor: (id: string) => void;
  initialDoctors?: Doctor[];
  isInitialLoading?: boolean;
  selectedDoctor?: string | null;
}

const DoctorSearch = ({ onSelectDoctor, initialDoctors = [], isInitialLoading = false, selectedDoctor }: DoctorSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(isInitialLoading);
  const { toast } = useToast();

  // Initialize with doctors passed from parent if available
  useEffect(() => {
    if (initialDoctors.length > 0) {
      setDoctors(initialDoctors);
      setFilteredDoctors(initialDoctors);
      // Extract unique specialties for filtering
      const uniqueSpecialties = [...new Set(initialDoctors.map(doctor => doctor.specialty))];
      setSpecialties(uniqueSpecialties);
    } else {
      // If no initial doctors, fetch them
      fetchDoctors();
    }
  }, [initialDoctors]);

  // Fetch doctors from Supabase if not provided (public view)
  const fetchDoctors = async () => {
    if (initialDoctors.length > 0) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('public_doctors')
        .select('doctor_id, doctor_name, avatar_url, specialty, consultation_fee, is_available, is_approved')
        .eq('is_available', true)
        .eq('is_approved', true);

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: Doctor[] = data.map((d: any) => ({
          id: d.doctor_id,
          name: d.doctor_name || 'Médico',
          specialty: d.specialty || 'Medicina Canábica',
          bio: 'Especialista em tratamentos canábicos.',
          image: d.avatar_url || `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`,
          availability: ['this-week']
        }));

        setDoctors(mapped);
        setFilteredDoctors(mapped);

        const uniqueSpecialties = [...new Set(data.map((d: any) => d.specialty).filter(Boolean))] as string[];
        setSpecialties(uniqueSpecialties);
      } else {
        toast({
          title: "Nenhum médico encontrado",
          description: "Não há médicos disponíveis no momento.",
        });
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
            onClick={handleClearFilters}
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
        selectedDoctor={selectedDoctor}
      />
    </div>
  );
};

export default DoctorSearch;
