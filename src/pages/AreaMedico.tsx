
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DoctorScheduleProvider } from '@/contexts/DoctorScheduleContext';
import { useDoctorSchedule } from '@/contexts/DoctorScheduleContext';
import DoctorTabs from '@/components/medico/DoctorTabs';
import HorarioDialog from '@/components/medico/HorarioDialog';
import MensagemDialog from '@/components/medico/MensagemDialog';
import ReceitaDialog from '@/components/medico/ReceitaDialog';

// DialogComponents is separate to avoid rendering dialogs before context is ready
const DialogComponents: React.FC = () => {
  const {
    horarioDialogOpen,
    setHorarioDialogOpen,
    selectedDay,
    handleRemoverHorario,
    handleAddSlot,
    getAvailableSlotsForDay,
    horariosDisponiveis,
    mensagemDialogOpen,
    setMensagemDialogOpen,
    selectedMensagem,
    handleResponderMensagem,
    receitaDialogOpen,
    setReceitaDialogOpen,
    selectedPaciente
  } = useDoctorSchedule();

  return (
    <>
      <HorarioDialog 
        open={horarioDialogOpen}
        onOpenChange={setHorarioDialogOpen}
        selectedDay={selectedDay}
        onRemoveHorario={handleRemoverHorario}
        onAddHorario={handleAddSlot}
        getHorariosConfig={getAvailableSlotsForDay}
        horariosDisponiveis={horariosDisponiveis}
      />
      
      <MensagemDialog 
        open={mensagemDialogOpen}
        onOpenChange={setMensagemDialogOpen}
        selectedMensagem={selectedMensagem}
        onResponder={handleResponderMensagem}
      />
      
      <ReceitaDialog 
        open={receitaDialogOpen}
        onOpenChange={setReceitaDialogOpen}
        selectedPaciente={selectedPaciente}
      />
    </>
  );
};

const AreaMedico: React.FC = () => {
  return (
    <DoctorScheduleProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Área do Médico</h1>
            <p className="text-gray-600">
              Gerencie seus pacientes, consultas e disponibilidade
            </p>
          </div>
          
          <DoctorTabs />
        </main>
        
        <DialogComponents />
        <Footer />
      </div>
    </DoctorScheduleProvider>
  );
};

export default AreaMedico;
