import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AgendarConsultaPaciente: React.FC<any> = () => {
  return (
    <Alert>
      <AlertDescription>
        O componente de agendamento de consulta está temporariamente desabilitado devido a atualizações no sistema.
      </AlertDescription>
    </Alert>
  );
};

export default AgendarConsultaPaciente;