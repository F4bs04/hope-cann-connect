import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DoctorScheduleContextType } from '@/types/doctorScheduleTypes';
import { useCalendarNavigation } from '@/hooks/useCalendarNavigation';
import { useHorarios } from '@/hooks/useHorarios';
import { usePacientesData } from '@/hooks/usePacientesData';
import { useDialogState } from '@/hooks/useDialogState';
import { todosHorariosDisponiveis } from '@/mocks/doctorScheduleMockData';
import { format } from 'date-fns';

const DoctorScheduleContext = createContext<DoctorScheduleContextType | undefined>(undefined);

export const DoctorScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const calendarNavigation = useCalendarNavigation();
  const horarios = useHorarios();
  const pacientesData = usePacientesData();
  const dialogState = useDialogState();
  const [currentConsultationDuration, setCurrentConsultationDuration] = useState("30");

  const handleFastAgendamento = ({ dia, horario }: { dia: Date; horario: string }) => {
    // Aqui você pode implementar a lógica para criar a consulta
    // Por enquanto vamos apenas mostrar um toast de sucesso
    toast({
      title: "Consulta agendada",
      description: `Agendamento rápido realizado com sucesso para ${format(dia, "dd/MM/yyyy")} às ${horario}`,
    });
  };

  // Initialize all horarios on first load
  useEffect(() => {
    horarios.applyPatternToWeek('all', 'all');
    toast({
      title: "Todos os horários disponibilizados",
      description: "Todos os dias da semana estão com horários completos disponíveis para consultas.",
    });
  }, []);

  // Combine all the hooks into a single context value
  const value: DoctorScheduleContextType = {
    ...calendarNavigation,
    ...horarios,
    ...pacientesData,
    ...dialogState,
    handleFastAgendamento,
    currentConsultationDuration,
    setCurrentConsultationDuration,
  };

  return (
    <DoctorScheduleContext.Provider value={value}>
      {children}
    </DoctorScheduleContext.Provider>
  );
};

export const useDoctorSchedule = (): DoctorScheduleContextType => {
  const context = useContext(DoctorScheduleContext);
  if (context === undefined) {
    throw new Error('useDoctorSchedule must be used within a DoctorScheduleProvider');
  }
  return context;
};
