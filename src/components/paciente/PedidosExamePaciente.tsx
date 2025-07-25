import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PedidosExamePaciente: React.FC = () => {
  return (
    <Alert>
      <AlertDescription>
        O componente de pedidos de exames está temporariamente desabilitado devido a atualizações no sistema.
      </AlertDescription>
    </Alert>
  );
};

export default PedidosExamePaciente;