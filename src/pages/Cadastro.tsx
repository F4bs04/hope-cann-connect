
import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import CadastroForm from '../components/cadastro/CadastroForm';

const Cadastro = () => {
  return (
    <PageContainer title="Cadastre-se como Paciente">
      <CadastroForm />
    </PageContainer>
  );
};

export default Cadastro;
