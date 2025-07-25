import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';

const PerfilMedico = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Perfil do Médico</h1>
          <p className="text-gray-600 mb-6">
            Esta funcionalidade está temporariamente desabilitada devido a atualizações no banco de dados.
          </p>
          <Button onClick={() => navigate('/')}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default PerfilMedico;