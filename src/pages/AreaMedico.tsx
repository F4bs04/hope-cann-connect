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

  const formatWeekday = (date: Date): string => {
    return format(date, 'EEEE', { locale: ptBR });
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
        ? [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde]
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

  const getAvailableSlotsForDay = (date: Date) => {
    const diaSemana = formatWeekday(date).toLowerCase() as keyof typeof horariosConfig;
    return horariosConfig[diaSemana] || [];
  };

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
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-hopecann-teal" />
                Próximas consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {consultas.filter(c => c.status === 'agendada').slice(0, 3).map(consulta => (
                  <div key={consulta.id} className="flex justify-between items-center p-2 border rounded-md">
                    <div>
                      <div className="font-medium">{consulta.paciente}</div>
                      <div className="text-sm text-gray-500">{format(parseISO(consulta.data), 'dd/MM')} - {consulta.horario}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setConsultaDialogOpen(true)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-hopecann-green" />
                Mensagens recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mensagens.slice(0, 3).map(mensagem => (
                  <div 
                    key={mensagem.id} 
                    className="flex justify-between items-center p-2 border rounded-md"
                    onClick={() => {
                      setSelectedMensagem(mensagem);
                      setMensagemDialogOpen(true);
                    }}
                  >
                    <div>
                      <div className="font-medium flex items-center">
                        {mensagem.paciente}
                        {!mensagem.lida && <span className="ml-2 h-2 w-2 rounded-full bg-hopecann-teal"></span>}
                      </div>
                      <div className="text-sm text-gray-500 truncate" style={{ maxWidth: "200px" }}>
                        {mensagem.mensagem}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">{format(parseISO(mensagem.data), 'dd/MM')}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-hopecann-blue" />
                Pacientes recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pacientesMock.slice(0, 3).map(paciente => (
                  <div 
                    key={paciente.id} 
                    className="flex justify-between items-center p-2 border rounded-md"
                    onClick={() => {
                      setSelectedPaciente(paciente);
                      setProntuarioDialogOpen(true);
                    }}
                  >
                    <div>
                      <div className="font-medium">{paciente.nome}</div>
                      <div className="text-sm text-gray-500">{paciente.condicao}</div>
                    </div>
                    <div className="text-xs text-gray-400">{format(parseISO(paciente.ultimaConsulta), 'dd/MM')}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-hopecann-teal">Área do Médico</h1>
        
        <Tabs defaultValue="agenda" className="w-full">
          <TabsList className="w-full md:w-auto justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="agenda" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="pacientes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Pacientes</span>
            </TabsTrigger>
            <TabsTrigger value="receitas" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Receitas</span>
            </TabsTrigger>
            <TabsTrigger value="horarios" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Horários</span>
            </TabsTrigger>
            <TabsTrigger value="mensagens" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Mensagens</span>
              {mensagens.filter(m => !m.lida).length > 0 && (
                <span className="bg-hopecann-teal text-white text-xs px-1.5 py-0.5 rounded-full">
                  {mensagens.filter(m => !m.lida).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="agenda" className="space-y-6">
            {renderAgendaView()}
          </TabsContent>
          
          <TabsContent value="pacientes">
            <Card>
              <CardHeader>
                <CardTitle>Meus Pacientes</CardTitle>
                <CardDescription>
                  Gerenciamento de pacientes e prontuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Idade</TableHead>
                        <TableHead>Condição</TableHead>
                        <TableHead>Última Consulta</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pacientesMock.map((paciente) => (
                        <TableRow key={paciente.id}>
                          <TableCell className="font-medium">{paciente.nome}</TableCell>
                          <TableCell>{paciente.idade} anos</TableCell>
                          <TableCell>{paciente.condicao}</TableCell>
                          <TableCell>{format(parseISO(paciente.ultimaConsulta), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedPaciente(paciente);
                                  setProntuarioDialogOpen(true);
                                }}
                              >
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">Ver prontuário</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedPaciente(paciente);
                                  setReceitaDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Nova receita</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="receitas">
            <Card>
              <CardHeader>
                <CardTitle>Receitas Emitidas</CardTitle>
                <CardDescription>
                  Histórico de receitas e prescrições
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Medicamento</TableHead>
                        <TableHead>Posologia</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receitasMock.map((receita) => (
                        <TableRow key={receita.id}>
                          <TableCell className="font-medium">{receita.paciente}</TableCell>
                          <TableCell>{receita.medicamento}</TableCell>
                          <TableCell>{receita.posologia}</TableCell>
                          <TableCell>{format(parseISO(receita.data), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver receita</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="horarios">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Disponibilidade</CardTitle>
                <CardDescription>
                  Configure seus horários disponíveis para consultas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {viewMode === 'calendar' && renderCalendarView()}
                
                {viewMode === 'week' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <Button variant="outline" size="sm" onClick={prevWeek}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Semana anterior
                      </Button>
                      <div className="font-medium">
                        {format(selectedWeekStart, "dd 'de' MMMM", { locale: ptBR })} - 
                        {format(addDays(selectedWeekStart, 6), "dd 'de' MMMM", { locale: ptBR })}
                      </div>
                      <Button variant="outline" size="sm" onClick={nextWeek}>
                        Próxima semana
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>

                    {renderBulkActions()}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                      {renderDaysOfWeek()}
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => setViewMode('calendar')}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        Visão de calendário
                      </Button>
                    </div>
                  </div>
                )}
                
                {viewMode === 'day' && (
                  <div>
                    {renderDaySelector()}
                    {renderDayTimeSlots()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="mensagens">
            <Card>
              <CardHeader>
                <CardTitle>Mensagens dos Pacientes</CardTitle>
                <CardDescription>
                  Responda às dúvidas e solicitações de seus pacientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mensagens.map((mensagem) => (
                        <TableRow key={mensagem.id}>
                          <TableCell className="font-medium">{mensagem.paciente}</TableCell>
                          <TableCell className="max-w-xs truncate">{mensagem.mensagem}</TableCell>
                          <TableCell>{format(parseISO(mensagem.data), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            {mensagem.lida ? (
                              <span className="text-green-600 text-xs">Respondida</span>
                            ) : (
                              <span className="text-amber-600 text-xs">Não lida</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedMensagem(mensagem);
                                setMensagemDialogOpen(true);
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span className="sr-only">Responder</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Dialog open={horarioDialogOpen} onOpenChange={setHorarioDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciar Horários</DialogTitle>
              <DialogDescription>
                {selectedDay && `Configure horários para ${format(selectedDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Período da manhã</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {horariosDisponiveis.manha.map((hora) => {
                      const isSelected = selectedDay && getAvailableSlotsForDay(selectedDay).includes(hora);
                      return (
                        <Button 
                          key={hora}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (selectedDay) {
                              if (isSelected) {
                                handleRemoverHorario(selectedDay, hora);
                              } else {
                                setSelectedSlot({ day: selectedDay, time: hora });
                                handleAdicionarHorario();
                              }
                            }
                          }}
                        >
                          {hora}
                          {isSelected && <Check className="ml-2 h-4 w-4" />}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Período da tarde</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {horariosDisponiveis.tarde.map((hora) => {
                      const isSelected = selectedDay && getAvailableSlotsForDay(selectedDay).includes(hora);
                      return (
                        <Button 
                          key={hora}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (selectedDay) {
                              if (isSelected) {
                                handleRemoverHorario(selectedDay, hora);
                              } else {
                                setSelectedSlot({ day: selectedDay, time: hora });
                                handleAdicionarHorario();
                              }
                            }
                          }}
                        >
                          {hora}
                          {isSelected && <Check className="ml-2 h-4 w-4" />}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedDay) {
                      handleQuickSetAvailability(selectedDay, 'none');
                    }
                  }}
                >
                  Limpar todos
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (selectedDay) {
                        handleQuickSetAvailability(selectedDay, 'morning');
                      }
                    }}
                  >
                    Só manhã
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (selectedDay) {
                        handleQuickSetAvailability(selectedDay, 'afternoon');
                      }
                    }}
                  >
                    Só tarde
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (selectedDay) {
                        handleQuickSetAvailability(selectedDay, 'all');
                      }
                    }}
                  >
                    Dia todo
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setHorarioDialogOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={prontuarioDialogOpen} onOpenChange={setProntuarioDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Prontuário do Paciente</DialogTitle>
              <DialogDescription>
                {selectedPaciente?.nome}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Dados Pessoais</h3>
                  <div className="p-4 border rounded-md space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-gray-500">Nome:</span>
                      <span className="text-sm">{selectedPaciente?.nome}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-gray-500">Idade:</span>
                      <span className="text-sm">{selectedPaciente?.idade} anos</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-gray-500">Condição:</span>
                      <span className="text-sm">{selectedPaciente?.condicao}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-gray-500">Última consulta:</span>
                      <span className="text-sm">{selectedPaciente?.ultimaConsulta ? format(parseISO(selectedPaciente.ultimaConsulta), 'dd/MM/yyyy') : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Histórico</h3>
                  <div className="p-4 border rounded-md h-40 overflow-y-auto">
                    <div className="space-y-3">
                      <div className="border-b pb-2">
                        <div className="text-xs text-gray-500">02/04/2025</div>
                        <div className="text-sm">Consulta de acompanhamento. Paciente relata melhora da dor.</div>
                      </div>
                      <div className="border-b pb-2">
                        <div className="text-xs text-gray-500">15/03/2025</div>
                        <div className="text-sm">Início do tratamento com óleo CBD 5%.</div>
                      </div>
                      <div className="border-b pb-2">
                        <div className="text-xs text-gray-500">28/02/2025</div>
                        <div className="text-sm">Primeira consulta. Diagnóstico inicial.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Evolução</h3>
                <Textarea 
                  placeholder="Adicione notas sobre a evolução do paciente..." 
                  className="min-h-32" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Receitas</h3>
                  <div className="p-2 border rounded-md h-40 overflow-y-auto">
                    {receitasMock.filter(r => r.paciente === selectedPaciente?.nome).length > 0 ? (
                      <div className="space-y-2">
                        {receitasMock.filter(r => r.paciente === selectedPaciente?.nome).map((receita, idx) => (
                          <div key={idx} className="p-2 border rounded-md text-sm">
                            <div className="font-medium">{receita.medicamento}</div>
                            <div className="text-xs text-gray-500">{receita.posologia}</div>
                            <div className="text-xs text-gray-400 mt-1">{format(parseISO(receita.data), 'dd/MM/yyyy')}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-gray-500">
                        Nenhuma receita encontrada
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Consultas</h3>
                  <div className="p-2 border rounded-md h-40 overflow-y-auto">
                    {consultasMock.filter(c => c.paciente === selectedPaciente?.nome).length > 0 ? (
                      <div className="space-y-2">
                        {consultasMock.filter(c => c.paciente === selectedPaciente?.nome).map((consulta, idx) => (
                          <div key={idx} className="p-2 border rounded-md text-sm">
                            <div className="flex justify-between">
                              <div className="font-medium">{format(parseISO(consulta.data), 'dd/MM/yyyy')}</div>
                              <div className="text-xs bg-gray-100 rounded-full px-2 py-0.5">
                                {consulta.status === 'agendada' ? 'Agendada' : 'Realizada'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">{consulta.horario}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-gray-500">
                        Nenhuma consulta encontrada
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedPaciente(selectedPaciente);
                  setReceitaDialogOpen(true);
                  setProntuarioDialogOpen(false);
                }}
              >
                Nova receita
              </Button>
              <Button onClick={() => setProntuarioDialogOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={receitaDialogOpen} onOpenChange={setReceitaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Receita</DialogTitle>
              <DialogDescription>
                {selectedPaciente?.nome}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium" htmlFor="medicamento">
                  Medicamento
                </label>
                <Select>
                  <SelectTrigger id="medicamento">
                    <SelectValue placeholder="Selecione o medicamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbd3">Óleo CBD 3%</SelectItem>
                    <SelectItem value="cbd5">Óleo CBD 5%</SelectItem>
                    <SelectItem value="cbd10">Óleo CBD 10%</SelectItem>
                    <SelectItem value="cbdthc20_1">Óleo CBD:THC 20:1</SelectItem>
                    <SelectItem value="cbdthc10_1">Óleo CBD:THC 10:1</SelectItem>
                    <SelectItem value="cbdthc5_1">Óleo CBD:THC 5:1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium" htmlFor="posologia">
                  Posologia
                </label>
                <Input id="posologia" placeholder="Ex: 10 gotas, 2x ao dia" />
              </div>
              
              <div>
                <label className="text-sm font-medium" htmlFor="observacoes">
                  Observações
                </label>
                <Textarea id="observacoes" placeholder="Observações adicionais..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReceitaDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setReceitaDialogOpen(false);
                toast({
                  title: "Receita emitida",
                  description: `Receita emitida para ${selectedPaciente?.nome}`,
                });
              }}>
                Emitir Receita
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={consultaDialogOpen} onOpenChange={setConsultaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes da Consulta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Paciente</label>
                  <div className="p-2 border rounded-md mt-1">
                    João Silva
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Data e Hora</label>
                  <div className="p-2 border rounded-md mt-1">
                    15/04/2025 - 09:00
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Condição</label>
                <div className="p-2 border rounded-md mt-1">
                  Dor crônica
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Observações</label>
                <Textarea placeholder="Adicione observações sobre esta consulta..." />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => handleCancelarConsulta(1)}
                className="text-red-500 hover:text-red-600"
              >
                Cancelar Consulta
              </Button>
              <Button onClick={() => setConsultaDialogOpen(false)}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={mensagemDialogOpen} onOpenChange={setMensagemDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mensagem do Paciente</DialogTitle>
              <DialogDescription>
                {selectedMensagem?.paciente}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-gray-50">
                <div className="text-sm">{selectedMensagem?.mensagem}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {selectedMensagem?.data && format(parseISO(selectedMensagem.data), 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Resposta</label>
                <Textarea 
                  placeholder="Escreva sua resposta para o paciente..." 
                  className="min-h-24 mt-1" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMensagemDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleResponderMensagem}>
                Enviar Resposta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default AreaMedico;
