
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCalendarNavigation } from '@/hooks/useCalendarNavigation';
import { useHorarios } from '@/hooks/useHorarios';
import { usePacientesData } from '@/hooks/usePacientesData';
import { useDialogState } from '@/hooks/useDialogState';
import { format } from 'date-fns';

interface DoctorScheduleContextType {
  // Calendar navigation
  viewMode: 'week' | 'day' | 'month';
  setViewMode: (mode: 'week' | 'day' | 'month') => void;
  selectedWeekStart: Date;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  selectedViewDay: Date;
  setSelectedViewDay: (date: Date) => void;
  prevWeek: () => void;
  nextWeek: () => void;
  prevDay: () => void;
  nextDay: () => void;
  
  // Horarios
  quickSetMode: 'morning' | 'afternoon' | 'all' | 'custom';
  selectedSlot: { day: Date, time: string } | null;
  selectedDay: Date | null;
  horariosConfig: any;
  setQuickSetMode: (mode: 'morning' | 'afternoon' | 'all' | 'custom') => void;
  setSelectedSlot: (slot: { day: Date, time: string } | null) => void;
  setSelectedDay: (day: Date | null) => void;
  getAvailableSlotsForDay: (date: Date) => string[];
  handleQuickSetAvailability: (day: Date, mode: 'morning' | 'afternoon' | 'all' | 'none') => void;
  applyPatternToWeek: (pattern: 'workdays' | 'weekend' | 'all' | 'none', timePattern: 'morning' | 'afternoon' | 'all' | 'none') => void;
  handleAdicionarHorario: () => void;
  handleRemoverHorario: (day: Date, time: string) => void;
  handleToggleDayAvailability: (day: Date, isAvailable: boolean) => void;
  handleDateSelect: (date: Date | undefined) => Date | undefined;
  handleAddSlot: (day: Date, time: string) => void;
  saveAvailability: () => Promise<boolean>;
  
  // Pacientes data
  pacientes: any[];
  consultas: any[];
  selectedPaciente: any;
  setSelectedPaciente: (paciente: any) => void;
  
  // Dialog state
  horarioDialogOpen: boolean;
  setHorarioDialogOpen: (open: boolean) => void;
  
  // Fast agendamento
  handleFastAgendamento: ({ dia, horario }: { dia: Date; horario: string }) => void;
  currentConsultationDuration: string;
  setCurrentConsultationDuration: (duration: string) => void;
}

const DoctorScheduleContext = createContext<DoctorScheduleContextType | undefined>(undefined);

export const DoctorScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const calendarNavigation = useCalendarNavigation();
  const horarios = useHorarios();
  const pacientesData = usePacientesData();
  const dialogState = useDialogState();
  const [currentConsultationDuration, setCurrentConsultationDuration] = useState("30");

  const handleFastAgendamento = ({ dia, horario }: { dia: Date; horario: string }) => {
    toast({
      title: "Consulta agendada",
      description: `Agendamento rápido realizado com sucesso para ${format(dia, "dd/MM/yyyy")} às ${horario}`,
    });
  };

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
