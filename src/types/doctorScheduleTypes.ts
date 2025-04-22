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

export type Anamnese = {
  queixa_principal: string;
  historia_doenca_atual: string;
  historia_medica_pregressa: string;
  historia_familiar: string;
  habitos_vida: string;
  medicamentos_em_uso: string;
};

export type SOAP = {
  subjetivo: string;
  objetivo: string;
  avaliacao: string;
  plano: string;
};

export type HistoricoPaciente = {
  id?: number;
  id_paciente: number;
  condicoes_medicas: string;
  alergias: string;
  medicamentos_atuais: string;
  historico_familiar: string;
  ultima_atualizacao: string;
  anamnese?: Anamnese;
  soap?: SOAP;
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

export type DoctorScheduleContextType = {
  pacientes: Paciente[];
  receitas: Receita[];
  consultas: Consulta[];
  mensagens: Mensagem[];
  selectedPaciente: Paciente | null;
  selectedMensagem: Mensagem | null;
  historicoPaciente: HistoricoPaciente | null;
  acompanhamentosPaciente: AcompanhamentoPaciente[];
  prontuarioDialogOpen: boolean;
  receitaDialogOpen: boolean;
  mensagemDialogOpen: boolean;
  setConsultas: React.Dispatch<React.SetStateAction<Consulta[]>>;
  setMensagens: React.Dispatch<React.SetStateAction<Mensagem[]>>;
  setSelectedPaciente: React.Dispatch<React.SetStateAction<Paciente | null>>;
  setSelectedMensagem: React.Dispatch<React.SetStateAction<Mensagem | null>>;
  setProntuarioDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setReceitaDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMensagemDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleResponderMensagem: () => void;
  handleCancelarConsulta: (consultaId: number) => void;
  handleSaveProntuario: (
    historico: HistoricoPaciente,
    acompanhamento: AcompanhamentoPaciente
  ) => void;
  
  viewMode: 'week' | 'day' | 'calendar';
  setViewMode: React.Dispatch<React.SetStateAction<'week' | 'day' | 'calendar'>>;
  selectedWeekStart: Date;
  selectedViewDay: Date;
  selectedDate: Date | undefined;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  setSelectedWeekStart: React.Dispatch<React.SetStateAction<Date>>;
  setSelectedViewDay: React.Dispatch<React.SetStateAction<Date>>;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  prevWeek: () => void;
  nextWeek: () => void;
  prevDay: () => void;
  nextDay: () => void;
  formatWeekday: (date: Date) => string;
  
  quickSetMode: 'morning' | 'afternoon' | 'all' | 'custom';
  setQuickSetMode: React.Dispatch<React.SetStateAction<'morning' | 'afternoon' | 'all' | 'custom'>>;
  selectedSlot: { day: Date, time: string } | null;
  setSelectedSlot: React.Dispatch<React.SetStateAction<{ day: Date, time: string } | null>>;
  selectedDay: Date | null;
  setSelectedDay: React.Dispatch<React.SetStateAction<Date | null>>;
  horariosConfig: HorariosConfig;
  horariosDisponiveis: { manha: string[], tarde: string[] };
  todosHorariosDisponiveis: string[];
  setHorariosConfig: React.Dispatch<React.SetStateAction<HorariosConfig>>;
  getAvailableSlotsForDay: (date: Date) => string[];
  handleQuickSetAvailability: (day: Date, mode: 'morning' | 'afternoon' | 'all' | 'none') => void;
  applyPatternToWeek: (pattern: 'workdays' | 'weekend' | 'all' | 'none', timePattern: 'morning' | 'afternoon' | 'all' | 'none') => void;
  handleAdicionarHorario: () => void;
  handleRemoverHorario: (day: Date, time: string) => void;
  handleToggleDayAvailability: (day: Date, isAvailable: boolean) => void;
  handleDateSelect: (date: Date | undefined) => Date | undefined;
  handleAddSlot: (day: Date, time: string) => void;
  saveAvailability: () => Promise<boolean>;
  
  horarioDialogOpen: boolean;
  setHorarioDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  consultaDialogOpen: boolean;
  setConsultaDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleFastAgendamento: (data: { dia: Date; horario: string }) => void;
  currentConsultationDuration: string;
  setCurrentConsultationDuration: React.Dispatch<React.SetStateAction<string>>;
};
