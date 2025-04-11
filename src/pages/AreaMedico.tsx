
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, startOfWeek, addWeeks, subWeeks, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Imported components
import CalendarViews from '@/components/medico/CalendarViews';
import SummaryCards from '@/components/medico/SummaryCards';
import PacientesTable from '@/components/medico/PacientesTable';
import ReceitasTable from '@/components/medico/ReceitasTable';
import MensagensTable from '@/components/medico/MensagensTable';
import HorarioDialog from '@/components/medico/HorarioDialog';
import MensagemDialog from '@/components/medico/MensagemDialog';
import ReceitaDialog from '@/components/medico/ReceitaDialog';

// Mock data
const pacientesMock = [
  { id: 1, nome: 'João Silva', idade: 42, condicao: 'Dor crônica', ultimaConsulta: '2025-03-15' },
  { id: 2, nome: 'Maria Oliveira', idade: 35, condicao: 'Ansiedade', ultimaConsulta: '2025-03-28' },
  { id: 3, nome: 'Carlos Souza', idade: 57, condicao: 'Parkinson', ultimaConsulta: '2025-04-02' },
  { id: 4, nome: 'Ana Pereira', idade: 29, condicao: 'Epilepsia', ultimaConsulta: '2025-03-20' },
  { id: 5, nome: 'Roberto Almeida', idade: 63, condicao: 'Fibromialgia', ultimaConsulta: '2025-04-05' }
];

const consultasMock = [
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

const horariosDisponiveis = {
  manha: ['08:00', '09:00', '10:00', '11:00'],
  tarde: ['13:00', '14:00', '15:00', '16:00', '17:00']
};

const todosHorariosDisponiveis = [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde];

type Paciente = typeof pacientesMock[0];
type Consulta = typeof consultasMock[0];
type Receita = typeof receitasMock[0];
type Mensagem = typeof mensagensMock[0];

const AreaMedico = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
  const [horariosConfig, setHorariosConfig] = useState({
    segunda: todosHorariosDisponiveis,
    terca: todosHorariosDisponiveis,
    quarta: todosHorariosDisponiveis,
    quinta: todosHorariosDisponiveis,
    sexta: todosHorariosDisponiveis,
    sabado: todosHorariosDisponiveis,
    domingo: todosHorariosDisponiveis
  });

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

  // Initialize all days with all timeslots available
  useEffect(() => {
    applyPatternToWeek('all', 'all');
    toast({
      title: "Todos os horários disponibilizados",
      description: "Todos os dias da semana estão com horários completos disponíveis para consultas.",
    });
  }, []);

  const renderAgendaView = () => {
    return (
      <div className="space-y-6">
        <SummaryCards 
          consultas={consultas}
          mensagens={mensagens}
          receitasMock={receitasMock}
          handleCancelarConsulta={handleCancelarConsulta}
          setSelectedMensagem={setSelectedMensagem}
          setMensagemDialogOpen={setMensagemDialogOpen}
        />
        
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
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Área do Médico</h1>
          <p className="text-gray-600">
            Gerencie seus pacientes, consultas e disponibilidade
          </p>
        </div>
        
        <Tabs defaultValue="agenda">
          <TabsList className="mb-6">
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
            <TabsTrigger value="receitas">Receitas</TabsTrigger>
            <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agenda">
            {renderAgendaView()}
          </TabsContent>
          
          <TabsContent value="pacientes">
            <PacientesTable 
              pacientes={pacientesMock}
              setSelectedPaciente={setSelectedPaciente}
              setProntuarioDialogOpen={setProntuarioDialogOpen}
              setReceitaDialogOpen={setReceitaDialogOpen}
            />
          </TabsContent>
          
          <TabsContent value="receitas">
            <ReceitasTable receitas={receitasMock} />
          </TabsContent>
          
          <TabsContent value="mensagens">
            <MensagensTable 
              mensagens={mensagens}
              setSelectedMensagem={setSelectedMensagem}
              setMensagemDialogOpen={setMensagemDialogOpen}
            />
          </TabsContent>
        </Tabs>
      </main>
      
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
      
      <Footer />
    </div>
  );
};

export default AreaMedico;
