
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UserRound } from 'lucide-react';

interface MedicosPacienteProps {
  pacienteId: number;
}

const MedicosPaciente: React.FC<MedicosPacienteProps> = ({ pacienteId }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Seus Médicos</h2>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <UserRound className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum médico encontrado</h3>
          <p className="text-gray-500">
            Você ainda não possui médicos vinculados ao seu perfil.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicosPaciente;
