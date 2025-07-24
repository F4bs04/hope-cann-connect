
import React, { useState } from 'react';
import ChatsPacienteList from './ChatsList';
import ChatPaciente from './ChatPaciente';

interface MedicosPacienteProps {
  pacienteId: number;
}

const MedicosPaciente: React.FC<MedicosPacienteProps> = ({ pacienteId }) => {
  const [selectedChat, setSelectedChat] = useState<any>(null);

  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat);
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
  };

  if (selectedChat) {
    return (
      <ChatPaciente
        medicoId={selectedChat.id_medico}
        pacienteId={pacienteId}
        medicoNome={selectedChat.medicos?.nome || 'Médico'}
        medicoEspecialidade={selectedChat.medicos?.especialidade || ''}
        medicoFoto={selectedChat.medicos?.foto_perfil}
        onBack={handleBackToChats}
      />
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Conversas com Médicos</h2>
      <ChatsPacienteList 
        pacienteId={pacienteId} 
        onSelectChat={handleSelectChat} 
      />
    </div>
  );
};

export default MedicosPaciente;
