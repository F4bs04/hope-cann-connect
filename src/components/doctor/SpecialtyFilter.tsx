
import React from 'react';

interface SpecialtyFilterProps {
  specialties: string[];
  selectedSpecialty: string;
  onSpecialtySelect: (specialty: string) => void;
}

const SpecialtyFilter = ({ specialties, selectedSpecialty, onSpecialtySelect }: SpecialtyFilterProps) => {
  return (
    <div className="flex-shrink-0 flex flex-wrap gap-2">
      <button
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selectedSpecialty === '' 
            ? 'bg-hopecann-teal text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => onSpecialtySelect('')}
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
          onClick={() => onSpecialtySelect(specialty)}
        >
          {specialty}
        </button>
      ))}
    </div>
  );
};

export default SpecialtyFilter;
