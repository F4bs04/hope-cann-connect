import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LaudosPaciente: React.FC = () => {
  return (
    <Alert>
      <AlertDescription>
        O componente de laudos está temporariamente desabilitado devido a atualizações no sistema.
      </AlertDescription>
    </Alert>
  );
};

export default LaudosPaciente;