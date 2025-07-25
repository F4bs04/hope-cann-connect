
import React, { useState, useEffect, useCallback } from 'react';
import { User, ChevronRight } from 'lucide-react';
import DoctorSearch from '../DoctorSearch';

interface DoctorSelectionProps {
  selectedDoctor: string | null;
  onSelectDoctor: (id: string) => void;
  onNext: () => void;
}

const DoctorSelection = ({ selectedDoctor, onSelectDoctor, onNext }: DoctorSelectionProps) => {
  // Uma variável de estado para controlar se o componente já foi inicializado
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use o useCallback para evitar recriações desnecessárias da função
  const handleSelectDoctor = useCallback((id: string) => {
    if (id !== selectedDoctor) {
      onSelectDoctor(id);
    }
  }, [selectedDoctor, onSelectDoctor]);
  
  // Inicialize apenas uma vez quando o componente montar
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, []);
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <User className="text-hopecann-teal" />
        Escolha um Especialista
      </h2>
      
      {/* Só renderizar após inicialização e passar doctores iniciais vazios para evitar fetches desnecessários */}
      {isInitialized && (
        <DoctorSearch 
          onSelectDoctor={handleSelectDoctor}
          initialDoctors={[]}
          isInitialLoading={true}
          selectedDoctor={selectedDoctor}
        />
      )}
      
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
