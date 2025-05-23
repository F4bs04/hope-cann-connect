
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DoctorFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('any');
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('all');
    setSelectedState('all');
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
        
        {/* Filter by specialty */}
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
              <SelectItem value="Neurologista">Neurologista</SelectItem>
              <SelectItem value="Psiquiatra">Psiquiatra</SelectItem>
              <SelectItem value="Clínica Geral">Clínica Geral</SelectItem>
              <SelectItem value="Reumatologista">Reumatologista</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Filter by state */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-2">
            Estado
          </label>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger id="state" className="w-full">
              <SelectValue placeholder="Todos os estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              <SelectItem value="SP">São Paulo</SelectItem>
              <SelectItem value="RJ">Rio de Janeiro</SelectItem>
              <SelectItem value="MG">Minas Gerais</SelectItem>
              <SelectItem value="RS">Rio Grande do Sul</SelectItem>
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
