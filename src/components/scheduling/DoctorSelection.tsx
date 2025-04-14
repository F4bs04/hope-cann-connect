
import React from 'react';
import { User, ChevronRight } from 'lucide-react';
import DoctorSearch from '../DoctorSearch';

interface DoctorSelectionProps {
  selectedDoctor: number | null;
  onSelectDoctor: (id: number) => void;
  onNext: () => void;
}

const DoctorSelection = ({ selectedDoctor, onSelectDoctor, onNext }: DoctorSelectionProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <User className="text-hopecann-teal" />
        Escolha um Especialista
      </h2>
      
      <DoctorSearch onSelectDoctor={onSelectDoctor} />
      
      <div className="flex justify-end mt-6">
        <button
          className="bg-hopecann-teal text-white px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          onClick={onNext}
          disabled={!selectedDoctor}
        >
          Próximo
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default DoctorSelection;
