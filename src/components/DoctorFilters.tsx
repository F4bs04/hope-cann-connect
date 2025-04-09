
import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Doctor availability options
const availabilityOptions = [
  { value: 'any', label: 'Qualquer disponibilidade' },
  { value: 'today', label: 'Hoje' },
  { value: 'this-week', label: 'Esta semana' },
  { value: 'next-week', label: 'Próxima semana' }
];

// Brazilian states
const brazilianStates = [
  { value: '', label: 'Todos os estados' },
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

const DoctorFilters = ({ 
  specialties, 
  onFilterChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('any');
  
  useEffect(() => {
    // Debounce the filter change to avoid too many updates
    const timeoutId = setTimeout(() => {
      onFilterChange({
        searchTerm,
        specialty: selectedSpecialty,
        state: selectedState,
        availability: selectedAvailability
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedSpecialty, selectedState, selectedAvailability, onFilterChange]);

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold">Filtrar Médicos</h3>
      
      <div className="space-y-4">
        {/* Search by name */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar por nome
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              id="search"
              type="text"
              placeholder="Digite o nome do médico..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Filter by specialty */}
        <div>
          <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
            Especialidade
          </label>
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger id="specialty" className="w-full">
              <SelectValue placeholder="Todas especialidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas especialidades</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Filter by state */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger id="state" className="w-full">
              <SelectValue placeholder="Todos os estados" />
            </SelectTrigger>
            <SelectContent>
              {brazilianStates.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Filter by availability */}
        <div>
          <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
            Disponibilidade
          </label>
          <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
            <SelectTrigger id="availability" className="w-full">
              <SelectValue placeholder="Qualquer disponibilidade" />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default DoctorFilters;
