
import React from 'react';
import { Search, User } from 'lucide-react';
import DoctorSearch from '../DoctorSearch';

interface DoctorStepProps {
  doctors: any[];
  isLoading: boolean;
  selectedDoctor: string | null;
  setSelectedDoctor: (id: string) => void;
  onNext: () => void;
  dbStatus: { success: boolean; message: string };
}

export const DoctorStep: React.FC<DoctorStepProps> = ({ 
  doctors, 
  isLoading, 
  selectedDoctor, 
  setSelectedDoctor, 
  onNext, 
  dbStatus 
}) => {
  const handleDoctorSelection = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    console.log("Selected doctor ID:", doctorId);
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <User className="text-hopecann-teal" />
        Escolha um Especialista
      </h2>
      
      <div className="mb-6">
        <DoctorSearch 
          onSelectDoctor={handleDoctorSelection}
          initialDoctors={doctors}
          isInitialLoading={isLoading}
          selectedDoctor={selectedDoctor}
        />
      </div>
      
      <div className="flex justify-end">
        <button
          className="bg-hopecann-teal text-white px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNext}
          disabled={!selectedDoctor}
        >
          Próximo
        </button>
      </div>
    </div>
  );
};
