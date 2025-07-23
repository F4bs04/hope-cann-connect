
import React from 'react';
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useUnifiedAuth';

interface PacienteHeaderProps {
  pacienteNome?: string;
}

const PacienteHeader: React.FC<PacienteHeaderProps> = ({ pacienteNome = "Paciente" }) => {
  const { logout } = useAuth();

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
          onClick={logout}
          className="text-gray-700 hover:text-gray-900 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </header>
  );
};

export default PacienteHeader;
