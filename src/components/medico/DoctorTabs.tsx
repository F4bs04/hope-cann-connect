
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDoctorSchedule } from '@/contexts/DoctorScheduleContext';
import AgendaTab from './AgendaTab';
import PacientesTable from './PacientesTable';
import ReceitasTable from './ReceitasTable';
import MensagensTable from './MensagensTable';
import ProntuarioDialog from './ProntuarioDialog';

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

  return (
    <>
      <Tabs defaultValue="agenda">
        <TabsList className="mb-6">
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
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
      </Tabs>
      
      <ProntuarioDialog 
        open={prontuarioDialogOpen}
        onOpenChange={setProntuarioDialogOpen}
      />
    </>
  );
};

export default DoctorTabs;
