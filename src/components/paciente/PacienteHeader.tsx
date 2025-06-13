
import React from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface PacienteHeaderProps {
  pacienteNome?: string;
}

const PacienteHeader: React.FC<PacienteHeaderProps> = ({ pacienteNome = "Paciente" }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-10">
      <div className="px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-hopecann-teal/10 p-2 rounded-full">
            <User className="h-6 w-6 text-hopecann-teal" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Área do Paciente</h1>
            <p className="text-sm text-gray-600">Bem-vindo(a), {pacienteNome}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="text-gray-700 hover:text-gray-900"
        >
          Sair
        </Button>
      </div>
    </header>
  );
};

export default PacienteHeader;
