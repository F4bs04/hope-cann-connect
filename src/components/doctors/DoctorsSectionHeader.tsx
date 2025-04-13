
import React from 'react';

interface DoctorsSectionHeaderProps {
  dbStatus: {
    success: boolean;
    message: string;
  };
}

const DoctorsSectionHeader = ({ dbStatus }: DoctorsSectionHeaderProps) => {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossa Equipe Médica</h2>
      <p className="text-lg text-gray-700 max-w-3xl mx-auto">
        Conheça os profissionais especializados que transformam vidas através do tratamento canábico personalizado
      </p>
      
      {/* Status do banco de dados - apenas em desenvolvimento */}
      {!dbStatus.success && (
        <div className="mt-4 p-3 bg-orange-100 text-orange-800 rounded-md inline-block text-sm">
          <p>Informação para desenvolvedor: {dbStatus.message}</p>
        </div>
      )}
    </div>
  );
};

export default DoctorsSectionHeader;
