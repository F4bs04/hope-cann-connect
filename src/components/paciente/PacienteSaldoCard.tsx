import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PacienteSaldoCard: React.FC = () => {
  return (
    <Alert>
      <AlertDescription>
        O componente de saldo está temporariamente desabilitado devido a atualizações no sistema.
      </AlertDescription>
    </Alert>
  );
};

export default PacienteSaldoCard;