import React, { createContext, useState, useContext, ReactNode } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

// Types
type Paciente = {
  id: number;
  nome: string;
  idade: number;
  condicao: string;
  ultimaConsulta: string;
};

type Consulta = {
  id: number;
  paciente: string;
  data: string;
  horario: string;
  status: 'agendada' | 'realizada' | 'cancelada';
};

type Receita = {
  id: number;
  paciente: string;
  medicamento: string;
  posologia: string;
  data: string;
};

type Mensagem = {
  id: number;
  paciente: string;
  mensagem: string;
  data: string;
  lida: boolean;
};

type HistoricoPaciente = {
  id?: number;
  id_paciente: number;
  condicoes_medicas: string;
  alergias: string;
  medicamentos_atuais: string;
  historico_familiar: string;
  ultima_atualizacao: string;
};

type AcompanhamentoPaciente = {
  id?: number;
  id_paciente: number;
  data_registro: string;
  sintomas: string;
  efeitos_colaterais: string;
  eficacia: string;
  notas_adicionais: string;
};

type HorariosConfig = {
  segunda: string[];
  terca: string[];
  quarta: string[];
  quinta: string[];
  sexta: string[];
  sabado: string[];
  domingo: string[];
};

// Mock data
const pacientesMock = [
  { id: 1, nome: 'João Silva', idade: 42, condicao: 'Dor crônica', ultimaConsulta: '2025-03-15' },
  { id: 2, nome: 'Maria Oliveira', idade: 35, condicao: 'Ansiedade', ultimaConsulta: '2025-03-28' },
  { id: 3, nome: 'Carlos Souza', idade: 57, condicao: 'Parkinson', ultimaConsulta: '2025-04-02' },
  { id: 4, nome: 'Ana Pereira', idade: 29, condicao: 'Epilepsia', ultimaConsulta: '2025-03-20' },
  { id: 5, nome: 'Roberto Almeida', idade: 63, condicao: 'Fibromialgia', ultimaConsulta: '2025-04-05' }
];

const consultasMock: Consulta[] = [
  { id: 1, paciente: 'João Silva', data: '2025-04-15', horario: '09:00', status: 'agendada' },
  { id: 2, paciente: 'Maria Oliveira', data: '2025-04-16', horario: '14:30', status: 'agendada' },
  { id: 3, paciente: 'Carlos Souza', data: '2025-04-12', horario: '10:15', status: 'realizada' },
  { id: 4, paciente: 'Ana Pereira', data: '2025-04-03', horario: '15:45', status: 'realizada' },
  { id: 5, paciente: 'Roberto Almeida', data: '2025-04-18', horario: '11:00', status: 'agendada' }
];

const receitasMock = [
  { id: 1, paciente: 'João Silva', medicamento: 'Óleo CBD 5%', posologia: '10 gotas, 2x ao dia', data: '2025-04-12' },
  { id: 2, paciente: 'Maria Oliveira', medicamento: 'Óleo CBD:THC 20:1', posologia: '5 gotas, à noite', data: '2025-04-10' },
  { id: 3, paciente: 'Ana Pereira', medicamento: 'Óleo CBD 3%', posologia: '8 gotas, 3x ao dia', data: '2025-04-03' }
];

const mensagensMock = [
  { id: 1, paciente: 'João Silva', mensagem: 'Doutor, estou sentindo uma melhora significativa com o tratamento.', data: '2025-04-11', lida: true },
  { id: 2, paciente: 'Maria Oliveira', mensagem: 'Tenho algumas dúvidas sobre os efeitos colaterais do medicamento.', data: '2025-04-14', lida: false },
  { id: 3, paciente: 'Roberto Almeida', mensagem: 'Posso aumentar a dosagem? Ainda estou sentindo dores.', data: '2025-04-13', lida: false }
];

const historicosPacientesMock: HistoricoPaciente[] = [
  { 
    id: 1, 
    id_paciente: 1, 
    condicoes_medicas: 'Dor crônica lombar, hipertensão controlada', 
    alergias: 'Penicilina, sulfas', 
    medicamentos_atuais: 'Losartana 50mg 1x/dia', 
    historico_familiar: 'Pai com diabetes, mãe com hipertensão',
    ultima_atualizacao: '2025-03-15T14:30:00Z'
  },
  { 
    id: 2, 
    id_paciente: 2, 
    condicoes_medicas: 'Transtorno de ansiedade generalizada, enxaqueca', 
    alergias: 'Dipirona', 
    medicamentos_atuais: 'Escitalopram 10mg 1x/dia', 
    historico_familiar: 'Irmã com depressão',
    ultima_atualizacao: '2025-03-28T10:15:00Z'
  }
];

const acompanhamentosPacientesMock: AcompanhamentoPaciente[] = [
  {
    id: 1,
    id_paciente: 1,
    data_registro: '2025-03-15T14:30:00Z',
    sintomas: 'Dor moderada na região lombar, dificuldade para dormir',
    efeitos_colaterais: 'Sonolência leve pela manhã',
    eficacia: 'Alívio parcial da dor após o uso do medicamento',
    notas_adicionais: 'Paciente relata melhora na qualidade do sono'
  },
  {
    id: 2,
    id_paciente: 2,
    data_registro: '2025-03-28T10:15:00Z',
    sintomas: 'Episódios de ansiedade menos frequentes, melhor controle da respiração',
    efeitos_colaterais: 'Boca seca ocasional',
    eficacia: 'Boa resposta ao tratamento com CBD',
    notas_adicionais: 'Considerar redução gradual da dose de ansiolítico'
  }
];

const horariosDisponiveis = {
  manha: ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
  tarde: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']
};

const todosHorariosDisponiveis = [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde];

interface DoctorScheduleContextType {
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
  horariosDisponiveis: typeof horariosDisponiveis;
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

const DoctorScheduleContext = createContext<DoctorScheduleContextType | undefined>(undefined);

export const DoctorScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(currentDate, { weekStartsOn: 0 }));
  const [selectedSlot, setSelectedSlot] = useState<{day: Date, time: string} | null>(null);
  const [horarioDialogOpen, setHorarioDialogOpen] = useState(false);
  const [receitaDialogOpen, setReceitaDialogOpen] = useState(false);
  const [consultaDialogOpen, setConsultaDialogOpen] = useState(false);
  const [prontuarioDialogOpen, setProntuarioDialogOpen] = useState(false);
  const [mensagemDialogOpen, setMensagemDialogOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [selectedMensagem, setSelectedMensagem] = useState<Mensagem | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensMock);
  const [consultas, setConsultas] = useState<Consulta[]>(consultasMock);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'calendar'>('week');
  const [selectedViewDay, setSelectedViewDay] = useState<Date>(new Date());
  const [quickSetMode, setQuickSetMode] = useState<'morning' | 'afternoon' | 'all' | 'custom'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [historicos, setHistoricos] = useState<HistoricoPaciente[]>(historicosPacientesMock);
  const [acompanhamentos, setAcompanhamentos] = useState<AcompanhamentoPaciente[]>(acompanhamentosPacientesMock);
  const [horariosConfig, setHorariosConfig] = useState<HorariosConfig>({
    segunda: todosHorariosDisponiveis,
    terca: todosHorariosDisponiveis,
    quarta: todosHorariosDisponiveis,
    quinta: todosHorariosDisponiveis,
    sexta: todosHorariosDisponiveis,
    sabado: todosHorariosDisponiveis,
    domingo: todosHorariosDisponiveis
  });

  const historicoPaciente = selectedPaciente 
    ? historicos.find(h => h.id_paciente === selectedPaciente.id) || null
    : null;

  const acompanhamentosPaciente = selectedPaciente
    ? acompanhamentos.filter(a => a.id_paciente === selectedPaciente.id)
    : [];

  const nextWeek = () => {
    setSelectedWeekStart(addWeeks(selectedWeekStart, 1));
  };

  const prevWeek = () => {
    setSelectedWeekStart(subWeeks(selectedWeekStart, 1));
  };

  const nextDay = () => {
    setSelectedViewDay(addDays(selectedViewDay, 1));
  };

  const prevDay = () => {
    setSelectedViewDay(addDays(selectedViewDay, -1));
  };

  const formatWeekday = (date: Date): string => {
    return format(date, 'EEEE', { locale: ptBR });
  };

  const getAvailableSlotsForDay = (date: Date) => {
    const diaSemana = formatWeekday(date).toLowerCase() as keyof typeof horariosConfig;
    return horariosConfig[diaSemana] || [];
  };

  const handleQuickSetAvailability = (day: Date, mode: 'morning' | 'afternoon' | 'all' | 'none') => {
    const diaSemana = formatWeekday(day).toLowerCase() as keyof typeof horariosConfig;
    let newSlots: string[] = [];
    
    if (mode === 'morning') {
      newSlots = [...horariosDisponiveis.manha];
    } else if (mode === 'afternoon') {
      newSlots = [...horariosDisponiveis.tarde];
    } else if (mode === 'all') {
      newSlots = [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde];
    }
    
    setHorariosConfig({
      ...horariosConfig,
      [diaSemana]: newSlots
    });
    
    toast({
      title: mode === 'none' ? "Dia indisponibilizado" : "Horários atualizados",
      description: `${format(day, 'EEEE', { locale: ptBR })}: ${
        mode === 'morning' ? 'Manhã disponível' : 
        mode === 'afternoon' ? 'Tarde disponível' : 
        mode === 'all' ? 'Dia todo disponível' : 
        'Indisponível'
      }`,
    });
  };

  const applyPatternToWeek = (pattern: 'workdays' | 'weekend' | 'all' | 'none', timePattern: 'morning' | 'afternoon' | 'all' | 'none') => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(selectedWeekStart, i));
    }
    
    const newConfig = { ...horariosConfig };
    
    days.forEach(day => {
      const dayName = formatWeekday(day).toLowerCase() as keyof typeof horariosConfig;
      const dayNumber = day.getDay(); // 0 is Sunday, 6 is Saturday
      const isWeekend = dayNumber === 0 || dayNumber === 6;
      const isWorkday = !isWeekend;
      
      if (
        (pattern === 'workdays' && isWorkday) ||
        (pattern === 'weekend' && isWeekend) ||
        pattern === 'all'
      ) {
        if (timePattern === 'morning') {
          newConfig[dayName] = [...horariosDisponiveis.manha];
        } else if (timePattern === 'afternoon') {
          newConfig[dayName] = [...horariosDisponiveis.tarde];
        } else if (timePattern === 'all') {
          newConfig[dayName] = todosHorariosDisponiveis;
        } else {
          newConfig[dayName] = [];
        }
      }
    });
    
    setHorariosConfig(newConfig);
    
    toast({
      title: "Horários em massa atualizados",
      description: `Padrão aplicado com sucesso aos ${
        pattern === 'workdays' ? 'dias úteis' : 
        pattern === 'weekend' ? 'finais de semana' : 
        'dias da semana'
      }`,
    });
  };

  const handleResponderMensagem = () => {
    if (selectedMensagem) {
      const updatedMensagens = mensagens.map(msg => 
        msg.id === selectedMensagem.id ? { ...msg, lida: true } : msg
      );
      setMensagens(updatedMensagens);
      setMensagemDialogOpen(false);
      
      toast({
        title: "Mensagem enviada",
        description: `Resposta enviada para ${selectedMensagem.paciente}`,
      });
    }
  };

  const handleCancelarConsulta = (consultaId: number) => {
    const updatedConsultas = consultas.filter(c => c.id !== consultaId);
    setConsultas(updatedConsultas);
    
    toast({
      title: "Consulta cancelada",
      description: "A consulta foi cancelada e o paciente foi notificado",
    });
  };

  const handleAdicionarHorario = () => {
    if (selectedSlot) {
      const diaSemana = formatWeekday(selectedSlot.day).toLowerCase() as keyof typeof horariosConfig;
      
      if (!horariosConfig[diaSemana].includes(selectedSlot.time)) {
        setHorariosConfig({
          ...horariosConfig,
          [diaSemana]: [...horariosConfig[diaSemana], selectedSlot.time].sort()
        });
        
        toast({
          title: "Horário adicionado",
          description: `${selectedSlot.time} adicionado para ${format(selectedSlot.day, 'EEEE', { locale: ptBR })}`,
        });
      }
      
      setHorarioDialogOpen(false);
      setSelectedSlot(null);
    }
  };

  const handleRemoverHorario = (day: Date, time: string) => {
    const diaSemana = formatWeekday(day).toLowerCase() as keyof typeof horariosConfig;
    const updatedHorarios = horariosConfig[diaSemana].filter(t => t !== time);
    
    setHorariosConfig({
      ...horariosConfig,
      [diaSemana]: updatedHorarios
    });
    
    toast({
      title: "Horário removido",
      description: `${time} removido de ${format(day, 'EEEE', { locale: ptBR })}`,
    });
  };

  const handleToggleDayAvailability = (day: Date, isAvailable: boolean) => {
    const diaSemana = formatWeekday(day).toLowerCase() as keyof typeof horariosConfig;
    
    setHorariosConfig({
      ...horariosConfig,
      [diaSemana]: isAvailable 
        ? todosHorariosDisponiveis
        : []
    });
    
    toast({
      title: isAvailable ? "Dia disponibilizado" : "Dia indisponibilizado",
      description: `${format(day, 'EEEE, dd/MM', { locale: ptBR })} ${isAvailable ? 'disponível' : 'indisponível'} para consultas`,
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedViewDay(date);
      setViewMode('day');
      
      toast({
        title: "Data selecionada",
        description: `${format(date, 'EEEE, dd/MM', { locale: ptBR })}`,
      });
    }
  };

  const handleAddSlot = (day: Date, time: string) => {
    setSelectedSlot({day, time});
    handleAdicionarHorario();
  };

  const handleSaveProntuario = (historico: HistoricoPaciente, acompanhamento: AcompanhamentoPaciente) => {
    const existingHistoricoIndex = historicos.findIndex(h => h.id_paciente === historico.id_paciente);
    
    if (existingHistoricoIndex >= 0) {
      const updatedHistoricos = [...historicos];
      updatedHistoricos[existingHistoricoIndex] = {
        ...updatedHistoricos[existingHistoricoIndex],
        ...historico,
        ultima_atualizacao: new Date().toISOString()
      };
      setHistoricos(updatedHistoricos);
    } else {
      setHistoricos([...historicos, {
        ...historico,
        id: historicos.length + 1,
        ultima_atualizacao: new Date().toISOString()
      }]);
    }
    
    setAcompanhamentos([...acompanhamentos, {
      ...acompanhamento,
      id: acompanhamentos.length + 1,
      data_registro: new Date().toISOString()
    }]);
    
    toast({
      title: "Prontuário atualizado",
      description: "As informações do paciente foram salvas com sucesso",
    });
  };

  React.useEffect(() => {
    applyPatternToWeek('all', 'all');
    toast({
      title: "Todos os horários disponibilizados",
      description: "Todos os dias da semana estão com horários completos disponíveis para consultas.",
    });
  }, []);

  const value = {
    currentDate,
    selectedWeekStart,
    selectedSlot,
    horarioDialogOpen,
    receitaDialogOpen,
    consultaDialogOpen,
    prontuarioDialogOpen,
    mensagemDialogOpen,
    selectedPaciente,
    selectedMensagem,
    mensagens,
    consultas,
    selectedDay,
    viewMode,
    selectedViewDay,
    quickSetMode,
    selectedDate,
    horariosConfig,
    horariosDisponiveis,
    todosHorariosDisponiveis,
    pacientes: pacientesMock,
    receitas: receitasMock,
    historicoPaciente,
    acompanhamentosPaciente,
    
    setCurrentDate,
    setSelectedWeekStart,
    setSelectedSlot,
    setHorarioDialogOpen,
    setReceitaDialogOpen,
    setConsultaDialogOpen,
    setProntuarioDialogOpen,
    setMensagemDialogOpen,
    setSelectedPaciente,
    setSelectedMensagem,
    setMensagens,
    setConsultas,
    setSelectedDay,
    setViewMode,
    setSelectedViewDay,
    setQuickSetMode,
    setSelectedDate,
    setHorariosConfig,
    
    nextWeek,
    prevWeek,
    nextDay,
    prevDay,
    formatWeekday,
    getAvailableSlotsForDay,
    handleQuickSetAvailability,
    applyPatternToWeek,
    handleResponderMensagem,
    handleCancelarConsulta,
    handleAdicionarHorario,
    handleRemoverHorario,
    handleToggleDayAvailability,
    handleDateSelect,
    handleAddSlot,
    handleSaveProntuario
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
