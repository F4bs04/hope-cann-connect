
import React from 'react';
import { Search } from 'lucide-react';

interface EmptyDoctorStateProps {
  onClearFilters: () => void;
}

const EmptyDoctorState = ({ onClearFilters }: EmptyDoctorStateProps) => {
  return (
    <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
      <Search className="mx-auto mb-4 text-gray-400" size={48} />
      <h3 className="text-xl font-medium mb-2">Nenhum médico encontrado</h3>
      <p className="text-gray-600 mb-4">
        Não encontramos médicos com os critérios de busca. Tente ajustar seus critérios ou volte mais tarde.
      </p>
      <button 
        onClick={onClearFilters}
        className="text-hopecann-teal hover:text-hopecann-teal/80 font-medium"
      >
        Limpar todos os filtros
      </button>
    </div>
  );
};

export default EmptyDoctorState;
