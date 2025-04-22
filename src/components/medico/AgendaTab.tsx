
import React from 'react';
import { useDoctorSchedule } from '@/contexts/DoctorScheduleContext';
import CalendarViews from './CalendarViews';
import SummaryCards from './SummaryCards';
import FastAgendamento from './FastAgendamento';

interface AgendaTabProps {
  isQuickMode?: boolean;
}

const AgendaTab: React.FC<AgendaTabProps> = ({ isQuickMode = false }) => {
  const {
    consultas,
    mensagens,
    receitas,
    viewMode,
    setViewMode,
    selectedWeekStart,
    selectedViewDay,
    selectedDate,
    quickSetMode,
    horariosConfig,
    horariosDisponiveis,
    handleDateSelect,
    applyPatternToWeek,
    handleToggleDayAvailability,
    handleQuickSetAvailability,
    handleRemoverHorario,
    formatWeekday,
    prevWeek,
    nextWeek,
    prevDay,
    nextDay,
    setQuickSetMode,
    setSelectedViewDay,
    setSelectedDay,
    setHorarioDialogOpen,
    setHorariosConfig,
    getAvailableSlotsForDay,
    handleCancelarConsulta,
    setSelectedMensagem,
    setMensagemDialogOpen,
    saveAvailability,
    handleFastAgendamento,
    currentConsultationDuration
  } = useDoctorSchedule();

  if (isQuickMode) {
    return (
      <div>
        <FastAgendamento 
          consultationDuration={currentConsultationDuration}
          onAgendamentoRapido={handleFastAgendamento}
          fullWidth
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SummaryCards 
          consultas={consultas}
          mensagens={mensagens}
          receitasMock={receitas}
          handleCancelarConsulta={handleCancelarConsulta}
          setSelectedMensagem={setSelectedMensagem}
          setMensagemDialogOpen={setMensagemDialogOpen}
        />
        <FastAgendamento 
          consultationDuration={currentConsultationDuration}
          onAgendamentoRapido={handleFastAgendamento}
        />
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Gerenciar disponibilidade
        </h2>
        
        <CalendarViews 
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedWeekStart={selectedWeekStart}
          selectedViewDay={selectedViewDay}
          selectedDate={selectedDate}
          quickSetMode={quickSetMode}
          horariosConfig={horariosConfig}
          horariosDisponiveis={horariosDisponiveis}
          handleDateSelect={handleDateSelect}
          applyPatternToWeek={applyPatternToWeek}
          handleToggleDayAvailability={handleToggleDayAvailability}
          handleQuickSetAvailability={handleQuickSetAvailability}
          handleRemoverHorario={handleRemoverHorario}
          formatWeekday={formatWeekday}
          prevWeek={prevWeek}
          nextWeek={nextWeek}
          prevDay={prevDay}
          nextDay={nextDay}
          setQuickSetMode={setQuickSetMode}
          setSelectedViewDay={setSelectedViewDay}
          setSelectedDay={setSelectedDay}
          setHorarioDialogOpen={setHorarioDialogOpen}
          setHorariosConfig={setHorariosConfig}
          getAvailableSlotsForDay={getAvailableSlotsForDay}
          saveAvailability={saveAvailability}
        />
      </div>
    </div>
  );
};

export default AgendaTab;
