
import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

// We'll use the same doctor data from the existing components
const doctorsData = [
  {
    id: 1,
    name: 'Dr. Ricardo Silva',
    specialty: 'Neurologista',
    bio: 'Especialista em tratamentos canábicos para distúrbios neurológicos.',
    image: '/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png'
  },
  {
    id: 2,
    name: 'Dra. Ana Santos',
    specialty: 'Psiquiatra',
    bio: 'Especializada em tratamentos para ansiedade e depressão.',
    image: '/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png'
  },
  {
    id: 3,
    name: 'Dr. Carlos Mendes',
    specialty: 'Neurologista',
    bio: 'Especialista em epilepsia e doenças neurodegenerativas.',
    image: '/lovable-uploads/8e0e4c0d-f012-449c-9784-9be7170458f5.png'
  },
  {
    id: 4,
    name: 'Dra. Mariana Costa',
    specialty: 'Clínica Geral',
    bio: 'Especialista em medicina integrativa e tratamentos canábicos.',
    image: '/lovable-uploads/4357c3c3-e33d-4756-b440-f505e4170615.png'
  }
];

// Extract unique specialties for filtering
const specialties = [...new Set(doctorsData.map(doctor => doctor.specialty))];

const DoctorSearch = ({ onSelectDoctor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState(doctorsData);

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
    let filtered = doctorsData;
    
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
                />
              </div>
              <div>
                <h3 className="font-medium">{doctor.name}</h3>
                <p className="text-sm text-hopecann-teal mb-1">{doctor.specialty}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredDoctors.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum médico encontrado com os critérios de busca.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;
