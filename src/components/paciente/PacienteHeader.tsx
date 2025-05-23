
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
    <header className="bg-white border-b border-gray-200 py-2">
      <div className="container mx-auto px-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-hopecann-teal/10 p-1.5 rounded-full">
            <User className="h-5 w-5 text-hopecann-teal" />
          </div>
          <div className="truncate max-w-[180px]">
            <h1 className="text-lg font-semibold text-gray-900 truncate">Área do Paciente</h1>
            <p className="text-xs text-gray-600 truncate">Bem-vindo(a), {pacienteNome}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="text-gray-700 hover:text-gray-900 text-xs px-3 py-1 h-auto"
        >
          Sair
        </Button>
      </div>
    </header>
  );
};

export default PacienteHeader;
