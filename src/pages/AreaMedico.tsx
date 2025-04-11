import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Users, FileText, History, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, X, Check, Plus, MessageSquare, Eye } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

// Tipos
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
  const [quickSetMode, setQuickSetMode] = useState<'morning' | 'afternoon' | 'all' | 'custom'>('custom');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [horariosConfig, setHorariosConfig] = useState({
    segunda: [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde],
    terca: [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde],
    quarta: [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde],
    quinta: [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde],
    sexta: [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde],
    sabado: [...horariosDisponiveis.manha],
    domingo: []
  });

  // Navegar entre semanas
  const nextWeek = () => {
    setSelectedWeekStart(addWeeks(selectedWeekStart, 1));
  };

  const prevWeek = () => {
    setSelectedWeekStart(subWeeks(selectedWeekStart, 1));
  };

  // Navegar entre dias (para visualização diária)
  const nextDay = () => {
    setSelectedViewDay(addDays(selectedViewDay, 1));
  };

  const prevDay = () => {
    setSelectedViewDay(addDays(selectedViewDay, -1));
  };

  // Quick set availability for specific periods
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

  // Apply a schedule pattern to multiple days
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
          newConfig[dayName] = [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde];
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

  // Função para formatar o nome do dia da semana
  const formatWeekday = (date: Date): string => {
    return format(date, 'EEEE', { locale: ptBR });
  };

  // Responder mensagem
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

  // Cancelar consulta
  const handleCancelarConsulta = (consultaId: number) => {
    const updatedConsultas = consultas.filter(c => c.id !== consultaId);
    setConsultas(updatedConsultas);
    
    toast({
      title: "Consulta cancelada",
      description: "A consulta foi cancelada e o paciente foi notificado",
    });
  };

  // Adicionar horário disponível
  const handleAdicionarHorario = () => {
    if (selectedSlot) {
      const diaSemana = formatWeekday(selectedSlot.day).toLowerCase() as keyof typeof horariosConfig;
      
      // Verificar se o horário já está na lista
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

  // Remover horário
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

  // Update handleToggleDayAvailability to be more intuitive
  const handleToggleDayAvailability = (day: Date, isAvailable: boolean) => {
    const diaSemana = formatWeekday(day).toLowerCase() as keyof typeof horariosConfig;
    
    setHorariosConfig({
      ...horariosConfig,
      [diaSemana]: isAvailable 
        ? [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde]
        : []
    });
    
    toast({
      title: isAvailable ? "Dia disponibilizado" : "Dia indisponibilizado",
      description: `${format(day, 'EEEE, dd/MM', { locale: ptBR })} ${isAvailable ? 'disponível' : 'indisponível'} para consultas`,
    });
  };

  // Enhanced calendar view for selecting availability
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedViewDay(date);
      setViewMode('day');
      
      // Show toast when date is selected
      toast({
        title: "Data selecionada",
        description: `${format(date, 'EEEE, dd/MM', { locale: ptBR })}`,
      });
    }
  };

  // Improved rendering of days of week with better usability
  const renderDaysOfWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(selectedWeekStart, i);
      days.push(day);
    }
    
    return days.map((day, index) => {
      const diaSemana = formatWeekday(day).toLowerCase() as keyof typeof horariosConfig;
      const timeSlotsCount = horariosConfig[diaSemana]?.length || 0;
      const hasMorningSlots = horariosConfig[diaSemana]?.some(slot => horariosDisponiveis.manha.includes(slot)) || false;
      const hasAfternoonSlots = horariosConfig[diaSemana]?.some(slot => horariosDisponiveis.tarde.includes(slot)) || false;
      
      return (
        <div 
          key={index} 
          className="border rounded-md overflow-hidden bg-white"
        >
          <div 
            className="text-center p-2 cursor-pointer hover:bg-gray-50 border-b"
            onClick={() => {
              setSelectedViewDay(day);
              setViewMode('day');
            }}
          >
            <div className="font-medium">
              {format(day, 'EEEE', { locale: ptBR })}
            </div>
            <div className="text-sm">
              {format(day, 'dd/MM')}
            </div>
          </div>
          
          <div className="p-2 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Disponibilidade:</span>
              <Switch 
                checked={timeSlotsCount > 0}
                onCheckedChange={(checked) => handleToggleDayAvailability(day, checked)}
                size="sm"
              />
            </div>
            
            {timeSlotsCount > 0 ? (
              <div className="space-y-2">
                <div className="flex gap-1">
                  <Button 
                    variant={hasMorningSlots && !hasAfternoonSlots ? "default" : "outline"} 
                    size="sm" 
                    className="flex-1 h-7 text-xs"
                    onClick={() => handleQuickSetAvailability(day, 'morning')}
                  >
                    Manhã
                  </Button>
                  <Button 
                    variant={!hasMorningSlots && hasAfternoonSlots ? "default" : "outline"} 
                    size="sm" 
                    className="flex-1 h-7 text-xs"
                    onClick={() => handleQuickSetAvailability(day, 'afternoon')}
                  >
                    Tarde
                  </Button>
                  <Button 
                    variant={hasMorningSlots && hasAfternoonSlots ? "default" : "outline"} 
                    size="sm" 
                    className="flex-1 h-7 text-xs"
                    onClick={() => handleQuickSetAvailability(day, 'all')}
                  >
                    Todos
                  </Button>
                </div>
                
                <div className="text-xs text-center text-gray-500">
                  {timeSlotsCount} horários • <button 
                    className="text-blue-500 hover:underline" 
                    onClick={() => {
                      setSelectedDay(day);
                      setHorarioDialogOpen(true);
                    }}
                  >
                    Detalhes
                  </button>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-7 text-xs"
                onClick={() => handleQuickSetAvailability(day, 'all')}
              >
                Disponibilizar
              </Button>
            )}
          </div>
        </div>
      );
    });
  };

  // Function to get available slots for a specific day
  const getAvailableSlotsForDay = (date: Date) => {
    const diaSemana = formatWeekday(date).toLowerCase() as keyof typeof horariosConfig;
    return horariosConfig[diaSemana] || [];
  };

  // Enhanced calendar view
  const renderCalendarView = () => {
    return (
      <div className="bg-white rounded-md p-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Selecione uma data</h3>
          <p className="text-sm text-gray-500 mb-4">
            Clique em uma data para configurar sua disponibilidade
          </p>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="mx-auto"
              classNames={{
                day_today: "bg-hopecann-teal/20 text-hopecann-teal font-medium",
                day_selected: "bg-hopecann-teal text-white hover:bg-hopecann-teal hover:text-white",
                day: "hover:bg-hopecann-teal/10 focus:bg-hopecann-teal/10 rounded-md"
              }}
              components={{
                DayContent: (props) => {
                  const date = props.date;
                  const dayName = formatWeekday(date).toLowerCase() as keyof typeof horariosConfig;
                  const hasSlots = horariosConfig[dayName]?.length > 0;
                  
                  return (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div>{props.date.getDate()}</div>
                      {hasSlots && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-hopecann-green rounded-full" />
                      )}
                    </div>
                  );
                }
              }}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Disponibilidade rápida</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => applyPatternToWeek('workdays', 'all')}
            >
              <Check className="h-4 w-4" /> Todos dias úteis
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => applyPatternToWeek('weekend', 'morning')}
            >
              <Check className="h-4 w-4" /> Finais de semana (manhãs)
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2 text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => applyPatternToWeek('all', 'none')}
            >
              <X className="h-4 w-4" /> Limpar tudo
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setViewMode('week')}
            >
              <Calendar className="h-4 w-4" /> Ver semana
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Improved day selector with better visual feedback
  const renderDaySelector = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={prevDay}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Dia anterior
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="font-medium">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {format(selectedViewDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              {isToday(selectedViewDay) && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Hoje</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <CalendarComponent
              mode="single"
              selected={selectedViewDay}
              onSelect={(date) => date && setSelectedViewDay(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Button variant="outline" size="sm" onClick={nextDay}>
          Próximo dia
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  };

  // Renderizar os horários disponíveis para visualização semanal
  const renderTimeSlots = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(selectedWeekStart, i);
      const dayName = formatWeekday(day).toLowerCase() as keyof typeof horariosConfig;
      const slots = horariosConfig[dayName] || [];
      days.push({ day, slots });
    }
    
    return days.map((dayInfo, dayIndex) => (
      <div key={dayIndex} className="border-t">
        <div className="py-2 px-2 bg-gray-50 flex justify-between items-center border-b">
          <span className="text-xs font-medium text-gray-500">
            {dayInfo.slots.length > 0 ? `${dayInfo.slots.length} horários` : 'Indisponível'}
          </span>
          <div className="flex items-center gap-2">
            <Switch 
              checked={dayInfo.slots.length > 0}
              onCheckedChange={(checked) => handleToggleDayAvailability(dayInfo.day, checked)}
              size="sm"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7"
              onClick={() => {
                setSelectedDay(dayInfo.day);
                setHorarioDialogOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {Array.isArray(dayInfo.slots) && dayInfo.slots.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 p-1">
            {dayInfo.slots.map((time, timeIndex) => (
              <div 
                key={`${dayIndex}-${timeIndex}`} 
                className="p-1 text-center border rounded-md text-xs flex justify-between items-center"
              >
                <span className="ml-1">{time}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => handleRemoverHorario(dayInfo.day, time)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2 text-center text-gray-400 text-xs">
            Sem horários disponíveis
          </div>
        )}
      </div>
    ));
  };

  // Improved time slots rendering for daily view
  const renderDayTimeSlots = () => {
    const dayName = formatWeekday(selectedViewDay).toLowerCase() as keyof typeof horariosConfig;
    const availableSlots = horariosConfig[dayName] || [];
    
    return (
      <div className="mt-4">
        <div className="mb-6 flex justify-between items-center">
          <div className="font-medium">
            Disponibilidade para {format(selectedViewDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{availableSlots.length > 0 ? `${availableSlots.length} horários disponíveis` : 'Indisponível'}</span>
            <Switch 
              checked={availableSlots.length > 0}
              onCheckedChange={(checked) => handleToggleDayAvailability(selectedViewDay, checked)}
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium mb-4 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-hopecann-teal" />
              Período da manhã
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {horariosDisponiveis.manha.map((hora) => {
                const isAvailable = availableSlots.includes(hora);
                return (
                  <Button 
                    key={hora} 
                    variant={isAvailable ? "default" : "outline"} 
                    className={`text-sm ${isAvailable ? 'bg-hopecann-teal text-white hover:bg-hopecann-teal/90' : 'text-gray-700'}`}
                    onClick={() => {
                      if (isAvailable) {
                        handleRemoverHorario(selectedViewDay, hora);
                      } else {
                        const diaSemana = formatWeekday(selectedViewDay).toLowerCase() as keyof typeof horariosConfig;
                        setHorariosConfig({
                          ...horariosConfig,
                          [diaSemana]: [...horariosConfig[diaSemana], hora].sort()
                        });
                        toast({
                          title: "Horário adicionado",
                          description: `${hora} adicionado para ${format(selectedViewDay, 'EEEE, dd/MM', { locale: ptBR })}`,
                        });
                      }
                    }}
                  >
                    {hora} {isAvailable && <Check className="h-3.5 w-3.5 ml-1" />}
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium mb-4 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-hopecann-green" />
              Período da tarde
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {horariosDisponiveis.tarde.map((hora) => {
                const isAvailable = availableSlots.includes(hora);
                return (
                  <Button 
                    key={hora} 
                    variant={isAvailable ? "default" : "outline"} 
                    className={`text-sm ${isAvailable ? 'bg-hopecann-green text-white hover:bg-hopecann-green/90' : 'text-gray-700'}`}
                    onClick={() => {
                      if (isAvailable) {
                        handleRemoverHorario(selectedViewDay, hora);
                      } else {
                        const diaSemana = formatWeekday(selectedViewDay).toLowerCase() as keyof typeof horariosConfig;
                        setHorariosConfig({
                          ...horariosConfig,
                          [diaSemana]: [...horariosConfig[diaSemana], hora].sort()
                        });
                        toast({
                          title: "Horário adicionado",
                          description: `${hora} adicionado para ${format(selectedViewDay, 'EEEE, dd/MM', { locale: ptBR })}`,
                        });
                      }
                    }}
                  >
                    {hora} {isAvailable && <Check className="h-3.5 w-3.5 ml-1" />}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon className="h-4 w-4" />
            Voltar para calendário
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setViewMode('week')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Visualização semanal
          </Button>
        </div>
      </div>
    );
  };

  // Add bulk actions to schedule management
  const renderBulkActions = () => {
    return (
      <div className="mb-6 p-4 border rounded-md bg-gray-50">
        <h3 className="text-sm font-medium mb-3">Configuração rápida</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <h4 className="text-xs font-medium mb-2">Aplicar a:</h4>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 text-xs"
                onClick={() => applyPatternToWeek('workdays', quickSetMode as any)}
              >
                Dias úteis
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 text-xs"
                onClick={() => applyPatternToWeek('weekend', quickSetMode as any)}
              >
                Fim de semana
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 text-xs"
                onClick={() => applyPatternToWeek('all', quickSetMode as any)}
              >
                Semana toda
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium mb-2">Definir como:</h4>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant={quickSetMode === 'morning' ? "default" : "outline"} 
                className="h-8 text-xs"
                onClick={() => setQuickSetMode('morning')}
              >
                Manhãs
              </Button>
              <Button 
                size="sm" 
                variant={quickSetMode === 'afternoon' ? "default" : "outline"} 
                className="h-8 text-xs"
                onClick={() => setQuickSetMode('afternoon')}
              >
                Tardes
              </Button>
              <Button 
                size="sm" 
                variant={quickSetMode === 'all' ? "default" : "outline"} 
                className="h-8 text-xs"
                onClick={() => setQuickSetMode('all')}
              >
                Dia todo
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 text-xs"
                onClick={() => applyPatternToWeek('all', 'none')}
              >
                Limpar todos
              </Button>
            </div>
          </div>
