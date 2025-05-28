
import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import PacienteForm from '@/components/forms/PacienteForm';
import { Button } from '@/components/ui/button';

import PacienteInfoDisplay from './perfil/PacienteInfoDisplay';
import DeleteAccountSection from './perfil/DeleteAccountSection';
import { Paciente } from './perfil/Paciente.types';
import { usePacienteProfileUpdate } from '@/hooks/usePacienteProfileUpdate';
import { usePacienteAccountDeletion } from '@/hooks/usePacienteAccountDeletion';

interface PacientePerfilDetalhesProps {
  paciente: Paciente | null;
  onUpdatePaciente: (updatedPaciente: Paciente) => void;
}

const PacientePerfilDetalhes: React.FC<PacientePerfilDetalhesProps> = ({ paciente, onUpdatePaciente }) => {
  const [isEditing, setIsEditing] = useState(false);

  const { submitProfileUpdate } = usePacienteProfileUpdate({
    pacienteId: paciente?.id,
    onUpdatePaciente,
    setIsEditing,
  });

  const { deleteAccount } = usePacienteAccountDeletion({
    paciente,
  });

  if (!paciente) {
    return <p className="text-gray-600">Não foi possível carregar os dados do perfil.</p>;
  }

  const handleFormSubmit = async (data: any) => {
    // Pass current paciente data to the hook for merging
    await submitProfileUpdate(data, paciente);
  };
  
  const handleDeleteAccount = async () => {
    await deleteAccount();
  };

  if (isEditing) {
    return (
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-hopecann-teal">Editar Perfil</h2>
        <PacienteForm
          initialData={{
            ...paciente,
            data_nascimento: paciente.data_nascimento 
          }}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-hopecann-teal">Meu Perfil</h2>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
          <Edit3 className="h-4 w-4" />
          Editar
        </Button>
      </div>
      
      <PacienteInfoDisplay paciente={paciente} />

      <DeleteAccountSection onDeleteAccount={handleDeleteAccount} />
    </div>
  );
};

export default PacientePerfilDetalhes;
