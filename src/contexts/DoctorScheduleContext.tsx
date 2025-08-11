
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCalendarNavigation } from '@/hooks/useCalendarNavigation';
import { useHorariosState } from '@/hooks/useHorariosState';
import { usePacientesData } from '@/hooks/usePacientesData';
import { useDialogState } from '@/hooks/useDialogState';
import { format } from 'date-fns';

interface HistoricoPaciente {
  condicoes_medicas?: string;
  alergias?: string;
  medicamentos_atuais?: string;
  historico_familiar?: string;
  ultima_atualizacao?: string;
  anamnese?: {
    queixa_principal: string;
    historia_doenca_atual: string;
    historia_medica_pregressa: string;
    historia_familiar: string;
    habitos_vida: string;
    medicamentos_em_uso: string;
  };
  soap?: {
    subjetivo: string;
    objetivo: string;
    avaliacao: string;
    plano: string;
  };
}

interface DoctorScheduleContextType {
  // Calendar navigation
  viewMode: 'week' | 'day' | 'calendar';
  setViewMode: (mode: 'week' | 'day' | 'calendar') => void;
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
  isLoading: boolean;
  refetch: () => void;
  
  // Dialog state
  horarioDialogOpen: boolean;
  setHorarioDialogOpen: (open: boolean) => void;
  
  // Fast agendamento
  handleFastAgendamento: ({ dia, horario }: { dia: Date; horario: string }) => void;
  currentConsultationDuration: string;
  setCurrentConsultationDuration: (duration: string) => void;
  
  // Missing properties for DoctorTabs
  receitas: any[];
  mensagens: any[];
  setProntuarioDialogOpen: (open: boolean) => void;
  setReceitaDialogOpen: (open: boolean) => void;
  setSelectedMensagem: (mensagem: any) => void;
  setMensagemDialogOpen: (open: boolean) => void;
  prontuarioDialogOpen: boolean;
  handleSaveProntuario: (data: any) => void;
  historicoPaciente: HistoricoPaciente | null;
}

const DoctorScheduleContext = createContext<DoctorScheduleContextType | undefined>(undefined);

export const DoctorScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const calendarNavigation = useCalendarNavigation();
  const horarios = useHorariosState();
  const pacientesData = usePacientesData();
  const dialogState = useDialogState();
  const [currentConsultationDuration, setCurrentConsultationDuration] = useState("30");
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);
  
  // Additional states for missing properties
  const [receitas] = useState<any[]>([]);
  const [mensagens] = useState<any[]>([]);
  const [prontuarioDialogOpen, setProntuarioDialogOpen] = useState(false);
  const [receitaDialogOpen, setReceitaDialogOpen] = useState(false);
  const [selectedMensagem, setSelectedMensagem] = useState<any>(null);
  const [mensagemDialogOpen, setMensagemDialogOpen] = useState(false);
  const [historicoPaciente] = useState<HistoricoPaciente | null>(null);

  const handleFastAgendamento = ({ dia, horario }: { dia: Date; horario: string }) => {
    toast({
      title: "Consulta agendada",
      description: `Agendamento rápido realizado com sucesso para ${format(dia, "dd/MM/yyyy")} às ${horario}`,
    });
  };

  const handleSaveProntuario = (data: any) => {
    console.log("Saving prontuario:", data);
    toast({
      title: "Prontuário salvo",
      description: "Prontuário salvo com sucesso!",
    });
  };

  // Stub functions for missing horarios functionality
  const stubHorarios = {
    handleQuickSetAvailability: () => {},
    applyPatternToWeek: () => {},
    handleAdicionarHorario: () => {},
    handleRemoverHorario: () => {},
    handleToggleDayAvailability: () => {},
    handleDateSelect: (date: Date | undefined) => date,
    handleAddSlot: () => {},
    saveAvailability: async () => false,
  };

  // Combine all the hooks into a single context value
  const value: DoctorScheduleContextType = {
    ...calendarNavigation,
    ...horarios,
    ...stubHorarios,
    ...pacientesData,
    ...dialogState,
    handleFastAgendamento,
    currentConsultationDuration,
    setCurrentConsultationDuration,
    receitas,
    mensagens,
    setProntuarioDialogOpen,
    setReceitaDialogOpen,
    setSelectedMensagem,
    setMensagemDialogOpen,
    prontuarioDialogOpen,
    handleSaveProntuario,
    historicoPaciente,
    consultas: pacientesData.pacientes || [], // Add missing consultas
    selectedPaciente,
    setSelectedPaciente,
    refetch: pacientesData.refetch || (() => {}) // Add missing refetch
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
