
import React from 'react';
import { Search } from 'lucide-react';

interface EmptyDoctorStateProps {
  onClearFilters: () => void;
}

const EmptyDoctorState = ({ onClearFilters }: EmptyDoctorStateProps) => {
  return (
    <div className="bg-white rounded-xl p-8 text-center">
      <Search className="mx-auto mb-4 text-gray-400" size={72} />
      <h3 className="text-2xl font-semibold mb-2">Nenhum médico encontrado</h3>
      <p className="text-gray-600 mb-6 max-w-xl mx-auto">
        Não encontramos médicos com os critérios de busca. Tente ajustar seus critérios ou volte mais tarde.
      </p>
      <button 
        onClick={onClearFilters}
        className="text-[#00BCD4] hover:text-[#00BCD4]/80 font-medium"
      >
        Limpar todos os filtros
      </button>
    </div>
  );
};

export default EmptyDoctorState;
