
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface HistoricoPacienteProps {
  pacienteId: number;
}

const HistoricoPaciente: React.FC<HistoricoPacienteProps> = ({ pacienteId }) => {
  // Future implementation: Fetch and display patient medical history
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Seu Histórico Médico</h2>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <FileText className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Histórico médico em desenvolvimento</h3>
          <p className="text-gray-500">
            Esta funcionalidade estará disponível em breve. Aqui você poderá consultar todo seu histórico médico e acompanhar a evolução do seu tratamento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricoPaciente;
