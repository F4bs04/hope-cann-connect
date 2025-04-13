
import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import CadastroForm from '../components/cadastro/CadastroForm';
import { useLocation } from 'react-router-dom';

const Cadastro = () => {
  const location = useLocation();
  // Check if user is coming from the scheduling flow
  const fromScheduling = location.state?.fromScheduling || false;
  
  return (
    <PageContainer title="Cadastre-se como Paciente">
      <CadastroForm fromScheduling={fromScheduling} />
    </PageContainer>
  );
};

export default Cadastro;
