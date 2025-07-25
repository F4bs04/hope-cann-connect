import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ReceitasPaciente: React.FC = () => {
  return (
    <Alert>
      <AlertDescription>
        O componente de receitas está temporariamente desabilitado devido a atualizações no sistema.
      </AlertDescription>
    </Alert>
  );
};

export default ReceitasPaciente;