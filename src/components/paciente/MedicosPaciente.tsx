
import React, { useState } from 'react';
// Chat components removidos temporariamente - aguardando implementação do schema

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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Conversas com Médicos</h2>
      <div className="text-center py-8 text-gray-500">
        <p>Sistema de chat em desenvolvimento</p>
        <p className="text-sm">Em breve você poderá conversar com seus médicos</p>
      </div>
    </div>
  );
};

export default MedicosPaciente;
