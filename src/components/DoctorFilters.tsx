
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface DoctorFiltersProps {
  onFiltersChange: (filters: {
    searchTerm: string;
    specialty: string;
    availability: string;
  }) => void;
}

const DoctorFilters: React.FC<DoctorFiltersProps> = ({ onFiltersChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('any');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(true);
  
  // Buscar especialidades dinâmicas dos médicos cadastrados
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('specialty')
          .eq('is_approved', true)
          .eq('is_available', true);
        
        if (error) {
          console.error('Erro ao buscar especialidades:', error);
          return;
        }
        
        // Extrair especialidades únicas
        const uniqueSpecialties = [...new Set(
          data
            ?.map(doctor => doctor.specialty)
            .filter(specialty => specialty && specialty.trim() !== '') || []
        )];
        
        setSpecialties(uniqueSpecialties);
      } catch (error) {
        console.error('Erro ao carregar especialidades:', error);
      } finally {
        setIsLoadingSpecialties(false);
      }
    };

    fetchSpecialties();
  }, []);
  
  // Notificar mudanças de filtros
  useEffect(() => {
    onFiltersChange({
      searchTerm,
      specialty: selectedSpecialty === 'all' ? '' : selectedSpecialty,
      availability: selectedAvailability === 'any' ? '' : selectedAvailability,
    });
  }, [searchTerm, selectedSpecialty, selectedAvailability, onFiltersChange]);
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('all');
    setSelectedAvailability('any');
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-100">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Filtrar Médicos</h3>
        <button 
          onClick={resetFilters}
          className="text-[#00BCD4] hover:text-[#00BCD4]/80 text-sm"
        >
          Limpar filtros
        </button>
      </div>
      
      <div className="space-y-5">
        {/* Search by name */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium mb-2">
            Buscar por nome
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              id="search"
              type="text"
              placeholder="Digite o nome do médico..."
              className="pl-10 py-5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Filter by specialty - Dynamic from database */}
        <div>
          <label htmlFor="specialty" className="block text-sm font-medium mb-2">
            Especialidade
          </label>
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger id="specialty" className="w-full">
              <SelectValue placeholder="Todas especialidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas especialidades</SelectItem>
              {isLoadingSpecialties ? (
                <SelectItem value="loading" disabled>Carregando...</SelectItem>
              ) : (
                specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        {/* Filter by availability */}
        <div>
          <label htmlFor="availability" className="block text-sm font-medium mb-2">
            Disponibilidade
          </label>
          <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
            <SelectTrigger id="availability" className="w-full">
              <SelectValue placeholder="Qualquer disponibilidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Qualquer disponibilidade</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="this-week">Esta semana</SelectItem>
              <SelectItem value="next-week">Próxima semana</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default DoctorFilters;
