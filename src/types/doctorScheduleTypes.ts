
export type Paciente = {
  id: number;
  nome: string;
  idade: number;
  condicao: string;
  ultimaConsulta: string;
};

export type Consulta = {
  id: number;
  paciente: string;
  data: string;
  horario: string;
  status: 'agendada' | 'realizada' | 'cancelada';
};

export type Receita = {
  id: number;
  paciente: string;
  medicamento: string;
  posologia: string;
  data: string;
};

export type Mensagem = {
  id: number;
  paciente: string;
  mensagem: string;
  data: string;
  lida: boolean;
};

export type HistoricoPaciente = {
  id?: number;
  id_paciente: number;
  condicoes_medicas: string;
  alergias: string;
  medicamentos_atuais: string;
  historico_familiar: string;
  ultima_atualizacao: string;
};

export type AcompanhamentoPaciente = {
  id?: number;
  id_paciente: number;
  data_registro: string;
  sintomas: string;
  efeitos_colaterais: string;
  eficacia: string;
  notas_adicionais: string;
};

export type HorariosConfig = {
  segunda: string[];
  terca: string[];
  quarta: string[];
  quinta: string[];
  sexta: string[];
  sabado: string[];
  domingo: string[];
};

export interface DoctorScheduleContextType {
  // Estado
  currentDate: Date;
  selectedWeekStart: Date;
  selectedSlot: { day: Date; time: string } | null;
  horarioDialogOpen: boolean;
  receitaDialogOpen: boolean;
  consultaDialogOpen: boolean;
  prontuarioDialogOpen: boolean;
  mensagemDialogOpen: boolean;
  selectedPaciente: Paciente | null;
  selectedMensagem: Mensagem | null;
  mensagens: Mensagem[];
  consultas: Consulta[];
  selectedDay: Date | null;
  viewMode: 'week' | 'day' | 'calendar';
  selectedViewDay: Date;
  quickSetMode: 'morning' | 'afternoon' | 'all' | 'custom';
  selectedDate: Date | undefined;
  horariosConfig: HorariosConfig;
  horariosDisponiveis: {
    manha: string[];
    tarde: string[];
  };
  todosHorariosDisponiveis: string[];
  pacientes: Paciente[];
  receitas: Receita[];
  historicoPaciente: HistoricoPaciente | null;
  acompanhamentosPaciente: AcompanhamentoPaciente[];
  
  // Setters
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  setSelectedWeekStart: React.Dispatch<React.SetStateAction<Date>>;
  setSelectedSlot: React.Dispatch<React.SetStateAction<{ day: Date; time: string } | null>>;
  setHorarioDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setReceitaDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setConsultaDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setProntuarioDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMensagemDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedPaciente: React.Dispatch<React.SetStateAction<Paciente | null>>;
  setSelectedMensagem: React.Dispatch<React.SetStateAction<Mensagem | null>>;
  setMensagens: React.Dispatch<React.SetStateAction<Mensagem[]>>;
  setConsultas: React.Dispatch<React.SetStateAction<Consulta[]>>;
  setSelectedDay: React.Dispatch<React.SetStateAction<Date | null>>;
  setViewMode: React.Dispatch<React.SetStateAction<'week' | 'day' | 'calendar'>>;
  setSelectedViewDay: React.Dispatch<React.SetStateAction<Date>>;
  setQuickSetMode: React.Dispatch<React.SetStateAction<'morning' | 'afternoon' | 'all' | 'custom'>>;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setHorariosConfig: React.Dispatch<React.SetStateAction<HorariosConfig>>;
  
  // Funções
  nextWeek: () => void;
  prevWeek: () => void;
  nextDay: () => void;
  prevDay: () => void;
  formatWeekday: (date: Date) => string;
  getAvailableSlotsForDay: (date: Date) => string[];
  handleQuickSetAvailability: (day: Date, mode: 'morning' | 'afternoon' | 'all' | 'none') => void;
  applyPatternToWeek: (pattern: 'workdays' | 'weekend' | 'all' | 'none', timePattern: 'morning' | 'afternoon' | 'all' | 'none') => void;
  handleResponderMensagem: () => void;
  handleCancelarConsulta: (consultaId: number) => void;
  handleAdicionarHorario: () => void;
  handleRemoverHorario: (day: Date, time: string) => void;
  handleToggleDayAvailability: (day: Date, isAvailable: boolean) => void;
  handleDateSelect: (date: Date | undefined) => void;
  handleAddSlot: (day: Date, time: string) => void;
  handleSaveProntuario: (historico: HistoricoPaciente, acompanhamento: AcompanhamentoPaciente) => void;
}
