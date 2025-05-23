
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import UserInfoCard from '@/components/medico/cadastro/UserInfoCard';
import RegistroMedicoForm from '@/components/medico/cadastro/RegistroMedicoForm';
import TermosResponsabilidade from '@/components/medico/cadastro/TermosResponsabilidade';
import { useMedicoRegistro } from '@/hooks/useMedicoRegistro';

const CompleteRegistroMedico = () => {
  const {
    form,
    isLoading,
    userInfo,
    fotoPreview,
    certificadoNome,
    termoDialogOpen,
    horarios,
    handleFileChange,
    handleTelefoneChange,
    handleCRMChange,
    onSubmit,
    setHorarios,
    setTermoDialogOpen,
    setCertificadoNome,
  } = useMedicoRegistro();

  const navigate = useNavigate();

  if (!userInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hopecann-teal"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="hopecann-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-hopecann-green mb-4">Complete seu cadastro</h1>
              <p className="text-gray-600">
                Precisamos de algumas informações adicionais para concluir seu cadastro como médico
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <UserInfoCard userInfo={userInfo} />
                
                <RegistroMedicoForm
                  form={form}
                  isLoading={isLoading}
                  fotoPreview={fotoPreview}
                  certificadoNome={certificadoNome}
                  termoDialogOpen={termoDialogOpen}
                  horarios={horarios}
                  handleFileChange={handleFileChange}
                  handleTelefoneChange={handleTelefoneChange}
                  handleCRMChange={handleCRMChange}
                  onSubmit={onSubmit}
                  setHorarios={setHorarios}
                  setTermoDialogOpen={setTermoDialogOpen}
                  hasUserPhoto={!!userInfo.photoUrl}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      <TermosResponsabilidade 
        open={termoDialogOpen} 
        onOpenChange={setTermoDialogOpen} 
      />
    </div>
  );
};

export default CompleteRegistroMedico;
