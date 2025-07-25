
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDoctorSchedule } from '@/contexts/DoctorScheduleContext';
import AgendaTab from './AgendaTab';
import PacientesTable from './PacientesTable';
import ReceitasTable from './ReceitasTable';
import MensagensTable from './MensagensTable';
import ProntuarioDialog from './ProntuarioDialog';
import ChatsList from './ChatsList';
import ChatMedico from './ChatMedico';

const DoctorTabs: React.FC = () => {
  const {
    pacientes,
    receitas,
    mensagens,
    setSelectedPaciente,
    setProntuarioDialogOpen,
    setReceitaDialogOpen,
    setSelectedMensagem,
    setMensagemDialogOpen,
    prontuarioDialogOpen
  } = useDoctorSchedule();
  
  // Estados para o sistema de chat
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const medicoId = 1; // Em um caso real, seria obtido da autenticação

  return (
    <>
      <Tabs defaultValue="agenda">
        <TabsList className="mb-6">
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
          <TabsTrigger value="chat">Chat com Pacientes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agenda">
          <AgendaTab />
        </TabsContent>
        
        <TabsContent value="pacientes">
          <PacientesTable 
            pacientes={pacientes}
            setSelectedPaciente={setSelectedPaciente}
            setProntuarioDialogOpen={setProntuarioDialogOpen}
            setReceitaDialogOpen={setReceitaDialogOpen}
          />
        </TabsContent>
        
        <TabsContent value="receitas">
          <ReceitasTable receitas={receitas} />
        </TabsContent>
        
        <TabsContent value="mensagens">
          <MensagensTable 
            mensagens={mensagens}
            setSelectedMensagem={setSelectedMensagem}
            setMensagemDialogOpen={setMensagemDialogOpen}
          />
        </TabsContent>
        
        <TabsContent value="chat">
          {selectedChat ? (
            <div className="p-4 text-center">
              <p className="text-gray-600">Chat temporariamente desativado</p>
            </div>
          ) : (
            <ChatsList 
              medicoId={medicoId} 
              onSelectChat={setSelectedChat} 
            />
          )}
        </TabsContent>
      </Tabs>
      
      <ProntuarioDialog 
        open={prontuarioDialogOpen}
        onOpenChange={setProntuarioDialogOpen}
      />
    </>
  );
};

export default DoctorTabs;
