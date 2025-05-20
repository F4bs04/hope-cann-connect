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
  
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const medicoId = Number(localStorage.getItem('medicoId')) || 1; // Fallback to 1 if not found

  return (
    <>
      <Tabs defaultValue="agenda" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="mb-6 whitespace-nowrap">
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
            <TabsTrigger value="receitas">Receitas</TabsTrigger>
            <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
            <TabsTrigger value="chat">Chat com Pacientes</TabsTrigger>
          </TabsList>
        </div>
        
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
            <ChatMedico
              medicoId={medicoId}
              pacienteId={selectedChat.pacientes_app.id}
              pacienteNome={selectedChat.pacientes_app.nome}
              motivoConsulta={selectedChat.consultas?.motivo || selectedChat.motivo_consulta}
              dataConsulta={selectedChat.data_inicio || selectedChat.data_consulta}
              onBack={() => setSelectedChat(null)}
            />
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
