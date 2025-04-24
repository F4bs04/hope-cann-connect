
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface PedidosExamePacienteProps {
  pacienteId: number;
}

const PedidosExamePaciente: React.FC<PedidosExamePacienteProps> = ({ pacienteId }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Seus Pedidos de Exame</h2>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <FileText className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum pedido de exame encontrado</h3>
          <p className="text-gray-500">
            Você ainda não possui pedidos de exame registrados no sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PedidosExamePaciente;
