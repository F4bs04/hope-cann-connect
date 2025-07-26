import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const PosAutenticacao = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();

  useEffect(() => {
    if (isAuthenticated && userType) {
      const path = userType === 'medico' ? '/area-medico' :
                   userType === 'admin_clinica' ? '/admin' : '/area-paciente';
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, userType, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm text-center">
          <h1 className="text-2xl font-bold mb-4">Autenticação concluída</h1>
          <p className="text-gray-700 mb-6">Seu login foi realizado com sucesso! Você será redirecionado para sua área em instantes.</p>
          <div className="loader mx-auto" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PosAutenticacao;
