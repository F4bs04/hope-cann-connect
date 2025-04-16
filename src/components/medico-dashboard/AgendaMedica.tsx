
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Save, 
  SunMedium, 
  Sunset, 
  Calendar, 
  Check, 
  X,
  Plus,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { format, addDays, startOfWeek, isEqual, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const durationsOptions = [
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "1 hora" },
  { value: "90", label: "1 hora e 30 minutos" },
  { value: "120", label: "2 horas" }
];

const AgendaMedica: React.FC = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'calendar'>('week');
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [currentDay, setCurrentDay] = useState<Date>(new Date());
  const [consultationDuration, setConsultationDuration] = useState("30");
  const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({
    'domingo': [],
    'segunda': ['08:00', '08:30', '09:00', '09:30', '10:00'],
    'terça': ['14:00', '14:30', '15:00', '15:30', '16:00'],
    'quarta': [],
    'quinta': ['08:00', '08:30', '09:00', '09:30', '14:00', '14:30', '15:00', '15:30'],
    'sexta': ['08:00', '08:30', '09:00', '09:30'],
    'sábado': []
  });

  const [quickSetMode, setQuickSetMode] = useState<'morning' | 'afternoon' | 'all' | 'none'>('morning');
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<Record<string, {start: string, end: string}[]>>({
    'domingo': [],
    'segunda': [{ start: '08:00', end: '10:30' }],
    'terça': [{ start: '14:00', end: '16:30' }],
    'quarta': [],
    'quinta': [{ start: '08:00', end: '10:30' }, { start: '14:00', end: '16:30' }],
    'sexta': [{ start: '08:00', end: '10:30' }],
    'sábado': []
  });

  // Gerar slots de 30 minutos (ou conforme a duração da consulta)
  const generateTimeSlots = (start: string, end: string, durationInMinutes: number = 30) => {
    const slots = [];
    let current = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    
    while (current < endTime) {
      slots.push(format(current, 'HH:mm'));
      current = new Date(current.getTime() + durationInMinutes * 60000);
    }
    
    return slots;
  };

  // Gerar todos os slots do dia baseados nos intervalos de tempo selecionados
  const generateAllDaySlots = (dayName: string, durationInMinutes: number) => {
    const ranges = selectedTimeRanges[dayName.toLowerCase()] || [];
    let allSlots: string[] = [];
    
    ranges.forEach(range => {
      const rangeSlots = generateTimeSlots(range.start, range.end, durationInMinutes);
      allSlots = [...allSlots, ...rangeSlots];
    });
    
    return allSlots;
  };

  // Para exibir os horários disponíveis nos cards do dia
  const getDaySlots = (day: Date): string[] => {
    const dayName = formatWeekday(day).toLowerCase();
    return generateAllDaySlots(dayName, parseInt(consultationDuration));
  };

  const formatWeekday = (date: Date): string => {
    return format(date, 'EEEE', { locale: ptBR });
  };

  const hasMorningSlots = (day: Date): boolean => {
    const dayName = formatWeekday(day).toLowerCase();
    const ranges = selectedTimeRanges[dayName] || [];
    return ranges.some(range => {
      const hour = parseInt(range.start.split(':')[0]);
      return hour < 12;
    });
  };

  const hasAfternoonSlots = (day: Date): boolean => {
    const dayName = formatWeekday(day).toLowerCase();
    const ranges = selectedTimeRanges[dayName] || [];
    return ranges.some(range => {
      const hour = parseInt(range.start.split(':')[0]);
      return hour >= 12;
    });
  };

  const nextWeek = () => {
    setSelectedWeekStart(addWeeks(selectedWeekStart, 1));
  };

  const prevWeek = () => {
    setSelectedWeekStart(subWeeks(selectedWeekStart, 1));
  };

  const nextDay = () => {
    setCurrentDay(addDays(currentDay, 1));
  };

  const prevDay = () => {
    setCurrentDay(addDays(currentDay, -1));
  };

  const handleDurationChange = (value: string) => {
    setConsultationDuration(value);
    toast({
      title: "Duração da consulta atualizada",
      description: `Suas consultas agora terão ${durationsOptions.find(d => d.value === value)?.label}.`,
    });
    
    // Atualizar os slots disponíveis com base na nova duração
    const newAvailableSlots: Record<string, string[]> = {};
    Object.keys(selectedTimeRanges).forEach(day => {
      newAvailableSlots[day] = generateAllDaySlots(day, parseInt(value));
    });
    
    setAvailableSlots(newAvailableSlots);
  };

  const toggleDayAvailability = (day: Date, available: boolean) => {
    const dayName = formatWeekday(day).toLowerCase();
    
    if (available) {
      // Default morning and afternoon ranges
      setSelectedTimeRanges(prev => ({
        ...prev,
        [dayName]: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }]
      }));
      
      // Generate slots based on these ranges
      setAvailableSlots(prev => ({
        ...prev,
        [dayName]: generateTimeSlots('08:00', '12:00', parseInt(consultationDuration))
          .concat(generateTimeSlots('14:00', '18:00', parseInt(consultationDuration)))
      }));
    } else {
      setSelectedTimeRanges(prev => ({
        ...prev,
        [dayName]: []
      }));
      
      setAvailableSlots(prev => ({
        ...prev,
        [dayName]: []
      }));
    }
    
    toast({
      title: available ? "Dia disponibilizado" : "Dia indisponibilizado",
      description: `${format(day, 'EEEE, dd/MM', { locale: ptBR })} ${available ? 'disponível' : 'indisponível'} para consultas.`,
    });
  };

  const addTimeRange = (day: Date) => {
    const dayName = formatWeekday(day).toLowerCase();
    const newRange = { start: '08:00', end: '12:00' };
    
    setSelectedTimeRanges(prev => ({
      ...prev,
      [dayName]: [...(prev[dayName] || []), newRange]
    }));
    
    // Update available slots
    const newSlots = generateTimeSlots(newRange.start, newRange.end, parseInt(consultationDuration));
    setAvailableSlots(prev => ({
      ...prev,
      [dayName]: [...(prev[dayName] || []), ...newSlots]
    }));
    
    toast({
      title: "Intervalo de horários adicionado",
      description: `Novo intervalo adicionado: ${newRange.start} - ${newRange.end}`,
    });
  };

  const removeTimeRange = (day: Date, index: number) => {
    const dayName = formatWeekday(day).toLowerCase();
    
    setSelectedTimeRanges(prev => ({
      ...prev,
      [dayName]: prev[dayName].filter((_, i) => i !== index)
    }));
    
    // Regenerate all available slots
    const updatedRanges = selectedTimeRanges[dayName].filter((_, i) => i !== index);
    let allSlots: string[] = [];
    
    updatedRanges.forEach(range => {
      const rangeSlots = generateTimeSlots(range.start, range.end, parseInt(consultationDuration));
      allSlots = [...allSlots, ...rangeSlots];
    });
    
    setAvailableSlots(prev => ({
      ...prev,
      [dayName]: allSlots
    }));
    
    toast({
      title: "Intervalo de horários removido",
      description: "O intervalo selecionado foi removido.",
    });
  };

  const updateTimeRange = (day: Date, index: number, field: 'start' | 'end', value: string) => {
    const dayName = formatWeekday(day).toLowerCase();
    
    setSelectedTimeRanges(prev => {
      const updatedRanges = [...prev[dayName]];
      updatedRanges[index] = {
        ...updatedRanges[index],
        [field]: value
      };
      
      return {
        ...prev,
        [dayName]: updatedRanges
      };
    });
    
    // Regenerate slots after a short delay to ensure state has updated
    setTimeout(() => {
      const ranges = selectedTimeRanges[dayName];
      let allSlots: string[] = [];
      
      ranges.forEach(range => {
        try {
          const rangeSlots = generateTimeSlots(range.start, range.end, parseInt(consultationDuration));
          allSlots = [...allSlots, ...rangeSlots];
        } catch (e) {
          console.error("Error generating time slots:", e);
        }
      });
      
      setAvailableSlots(prev => ({
        ...prev,
        [dayName]: allSlots
      }));
    }, 100);
  };

  const setDayAvailability = (day: Date, mode: 'morning' | 'afternoon' | 'all' | 'none') => {
    const dayName = formatWeekday(day).toLowerCase();
    let newRanges: {start: string, end: string}[] = [];
    
    if (mode === 'morning' || mode === 'all') {
      newRanges.push({ start: '08:00', end: '12:00' });
    }
    
    if (mode === 'afternoon' || mode === 'all') {
      newRanges.push({ start: '14:00', end: '18:00' });
    }
    
    setSelectedTimeRanges(prev => ({
      ...prev,
      [dayName]: newRanges
    }));
    
    // Generate all slots from the new ranges
    let allSlots: string[] = [];
    newRanges.forEach(range => {
      const rangeSlots = generateTimeSlots(range.start, range.end, parseInt(consultationDuration));
      allSlots = [...allSlots, ...rangeSlots];
    });
    
    setAvailableSlots(prev => ({
      ...prev,
      [dayName]: allSlots
    }));
    
    toast({
      title: "Disponibilidade atualizada",
      description: `${format(day, 'EEEE', { locale: ptBR })}: ${
        mode === 'morning' ? 'Manhã disponível' : 
        mode === 'afternoon' ? 'Tarde disponível' : 
        mode === 'all' ? 'Dia todo disponível' : 
        'Indisponível'
      }`,
    });
  };

  const applyToWeek = (pattern: 'workdays' | 'weekend' | 'all', mode: 'morning' | 'afternoon' | 'all' | 'none') => {
    let newTimeRanges = { ...selectedTimeRanges };
    let newAvailableSlots = { ...availableSlots };
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(selectedWeekStart, i);
      const dayOfWeek = day.getDay();
      const dayName = formatWeekday(day).toLowerCase();
      
      const isWorkday = dayOfWeek >= 1 && dayOfWeek <= 5;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if ((pattern === 'workdays' && isWorkday) || 
          (pattern === 'weekend' && isWeekend) || 
          pattern === 'all') {
        
        let ranges: {start: string, end: string}[] = [];
        
        if (mode === 'morning' || mode === 'all') {
          ranges.push({ start: '08:00', end: '12:00' });
        }
        
        if (mode === 'afternoon' || mode === 'all') {
          ranges.push({ start: '14:00', end: '18:00' });
        }
        
        newTimeRanges[dayName] = ranges;
        
        // Generate slots for this day
        let daySlots: string[] = [];
        ranges.forEach(range => {
          const rangeSlots = generateTimeSlots(range.start, range.end, parseInt(consultationDuration));
          daySlots = [...daySlots, ...rangeSlots];
        });
        
        newAvailableSlots[dayName] = daySlots;
      }
    }
    
    setSelectedTimeRanges(newTimeRanges);
    setAvailableSlots(newAvailableSlots);
    
    toast({
      title: "Disponibilidade em massa atualizada",
      description: `Padrão aplicado com sucesso aos ${
        pattern === 'workdays' ? 'dias úteis' : 
        pattern === 'weekend' ? 'finais de semana' : 
        'dias da semana'
      }`,
    });
  };

  const handleSaveAvailability = () => {
    toast({
      title: "Disponibilidade salva",
      description: "Sua agenda foi atualizada com sucesso!",
    });
  };

  const renderWeekView = () => (
    <>
      {/* Duração da consulta */}
      <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2 text-[#00B3B0]" />
          Defina a duração padrão da sua consulta
        </h3>
        <div className="w-full md:w-1/3">
          <Select value={consultationDuration} onValueChange={handleDurationChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a duração" />
            </SelectTrigger>
            <SelectContent>
              {durationsOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-2">
            Esta configuração afeta a quantidade de horários disponíveis nos intervalos selecionados.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
        <h3 className="text-sm font-medium text-blue-700 mb-3">Configuração Rápida</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-blue-700 mb-2">Aplicar a:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs"
                onClick={() => applyToWeek('workdays', quickSetMode)}
              >
                Dias úteis
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs"
                onClick={() => applyToWeek('weekend', quickSetMode)}
              >
                Fim de semana
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs"
                onClick={() => applyToWeek('all', quickSetMode)}
              >
                Semana toda
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-blue-700 mb-2">Definir como:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={quickSetMode === 'morning' ? "default" : "outline"} 
                size="sm" 
                className={`h-8 text-xs flex items-center gap-1 ${quickSetMode === 'morning' ? 'bg-blue-600' : ''}`}
                onClick={() => setQuickSetMode('morning')}
              >
                <SunMedium className="h-3 w-3" />
                Manhãs
              </Button>
              <Button 
                variant={quickSetMode === 'afternoon' ? "default" : "outline"} 
                size="sm" 
                className={`h-8 text-xs flex items-center gap-1 ${quickSetMode === 'afternoon' ? 'bg-orange-500' : ''}`}
                onClick={() => setQuickSetMode('afternoon')}
              >
                <Sunset className="h-3 w-3" />
                Tardes
              </Button>
              <Button 
                variant={quickSetMode === 'all' ? "default" : "outline"} 
                size="sm" 
                className={`h-8 text-xs flex items-center gap-1 ${quickSetMode === 'all' ? 'bg-green-600' : ''}`}
                onClick={() => setQuickSetMode('all')}
              >
                <Check className="h-3 w-3" />
                Dia todo
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => applyToWeek('all', 'none')}
              >
                <X className="h-3 w-3" />
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={prevWeek}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Semana anterior
        </Button>
        <h3 className="text-lg font-medium">
          {format(selectedWeekStart, "dd 'de' MMMM", { locale: ptBR })} - {format(addDays(selectedWeekStart, 6), "dd 'de' MMMM", { locale: ptBR })}
        </h3>
        <Button variant="outline" size="sm" onClick={nextWeek}>
          Próxima semana <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => {
          const day = addDays(selectedWeekStart, i);
          const dayName = formatWeekday(day);
          const dayOfMonth = format(day, 'dd/MM');
          const timeRanges = selectedTimeRanges[dayName.toLowerCase()] || [];
          const hasSlots = timeRanges.length > 0;
          
          return (
            <div key={i} className="border rounded-md overflow-hidden bg-white hover:shadow transition-shadow">
              <div 
                className={`text-center p-2 cursor-pointer border-b ${
                  (day.getDay() === 0 || day.getDay() === 6) ? 'bg-orange-50' : 'bg-blue-50'
                }`}
                onClick={() => {
                  setCurrentDay(day);
                  setViewMode('day');
                }}
              >
                <div className="font-medium capitalize">{dayName}</div>
                <div className="text-sm font-bold">{dayOfMonth}</div>
              </div>
              
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Disponível:</span>
                  <Switch 
                    checked={hasSlots}
                    onCheckedChange={(checked) => toggleDayAvailability(day, checked)}
                    size="sm"
                  />
                </div>
                
                {hasSlots ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-1">
                      <Button 
                        variant={hasMorningSlots(day) ? "default" : "outline"} 
                        size="sm" 
                        className={`h-7 text-xs flex items-center justify-center gap-1 ${hasMorningSlots(day) ? 'bg-blue-600' : ''}`}
                        onClick={() => setDayAvailability(day, 'morning')}
                      >
                        <SunMedium className="h-3 w-3" />
                        Manhã
                      </Button>
                      <Button 
                        variant={hasAfternoonSlots(day) ? "default" : "outline"} 
                        size="sm" 
                        className={`h-7 text-xs flex items-center justify-center gap-1 ${hasAfternoonSlots(day) ? 'bg-orange-500' : ''}`}
                        onClick={() => setDayAvailability(day, 'afternoon')}
                      >
                        <Sunset className="h-3 w-3" />
                        Tarde
                      </Button>
                    </div>
                    
                    <div className="mt-2">
                      {timeRanges.map((range, idx) => (
                        <div key={idx} className="text-xs flex justify-between items-center bg-gray-50 p-1 rounded mb-1">
                          <span className="text-gray-600">
                            {range.start} - {range.end}
                          </span>
                          <button 
                            className="text-red-500 hover:text-red-700" 
                            onClick={() => removeTimeRange(day, idx)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full h-6 text-xs mt-1 flex items-center justify-center text-blue-500"
                        onClick={() => {
                          setCurrentDay(day);
                          setViewMode('day');
                        }}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {generateAllDaySlots(dayName.toLowerCase(), parseInt(consultationDuration)).length} horários
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-7 text-xs"
                    onClick={() => setDayAvailability(day, 'all')}
                  >
                    Disponibilizar
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderDayView = () => {
    const dayName = formatWeekday(currentDay);
    const timeRanges = selectedTimeRanges[dayName.toLowerCase()] || [];
    const availableTimeSlots = generateAllDaySlots(dayName.toLowerCase(), parseInt(consultationDuration));
    const isMorningSelected = hasMorningSlots(currentDay);
    const isAfternoonSelected = hasAfternoonSlots(currentDay);
    
    const timeOptions = [];
    for (let hour = 5; hour < 22; hour++) {
      for (let min = 0; min < 60; min += 30) {
        timeOptions.push(
          `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
        );
      }
    }
    
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" size="sm" onClick={prevDay}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Dia anterior
          </Button>
          <div className="flex items-center">
            <h3 className="text-xl font-medium capitalize">
              {dayName}, {format(currentDay, "dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setViewMode('week')} className="ml-2">
              <Calendar className="h-4 w-4 mr-1" /> Ver semana
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={nextDay}>
            Próximo dia <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        {/* Duração da consulta */}
        <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-[#00B3B0]" />
            Duração padrão da consulta: <span className="font-bold ml-2">
              {durationsOptions.find(d => d.value === consultationDuration)?.label}
            </span>
          </h3>
          <div className="flex items-center mb-4">
            <span className="text-xs text-gray-500 mr-2">Alterar:</span>
            <div className="w-40">
              <Select value={consultationDuration} onValueChange={handleDurationChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Duração" />
                </SelectTrigger>
                <SelectContent>
                  {durationsOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Disponibilidade do dia */}
        <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-[#00B3B0]" />
              Disponibilidade do dia
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{availableTimeSlots.length > 0 ? `${availableTimeSlots.length} horários disponíveis` : 'Indisponível'}</span>
              <Switch 
                checked={timeRanges.length > 0}
                onCheckedChange={(checked) => toggleDayAvailability(currentDay, checked)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-6">
            <Button 
              variant={isMorningSelected ? "default" : "outline"} 
              className={`text-sm flex items-center justify-center gap-1 ${isMorningSelected ? 'bg-blue-600' : ''}`}
              onClick={() => setDayAvailability(currentDay, isMorningSelected ? 'afternoon' : 'all')}
            >
              <SunMedium className="h-4 w-4" />
              Manhã (8h - 12h)
            </Button>
            <Button 
              variant={isAfternoonSelected ? "default" : "outline"} 
              className={`text-sm flex items-center justify-center gap-1 ${isAfternoonSelected ? 'bg-orange-500' : ''}`}
              onClick={() => setDayAvailability(currentDay, isAfternoonSelected ? 'morning' : 'all')}
            >
              <Sunset className="h-4 w-4" />
              Tarde (14h - 18h)
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Períodos de disponibilidade</h4>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs flex items-center"
                onClick={() => addTimeRange(currentDay)}
              >
                <Plus className="h-3 w-3 mr-1" /> Adicionar período
              </Button>
            </div>
            
            {timeRanges.length > 0 ? (
              <div className="space-y-3">
                {timeRanges.map((range, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 p-3 rounded-md border">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Início</span>
                        <Select 
                          value={range.start} 
                          onValueChange={(value) => updateTimeRange(currentDay, idx, 'start', value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Início" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.slice(0, -1).map(option => (
                              <SelectItem 
                                key={option} 
                                value={option}
                                disabled={option >= range.end}
                              >
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Fim</span>
                        <Select 
                          value={range.end} 
                          onValueChange={(value) => updateTimeRange(currentDay, idx, 'end', value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Fim" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.slice(1).map(option => (
                              <SelectItem 
                                key={option} 
                                value={option}
                                disabled={option <= range.start}
                              >
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeTimeRange(currentDay, idx)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remover período</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-md">
                Nenhum período configurado para este dia.
              </div>
            )}
          </div>
        </div>
        
        {/* Horários gerados */}
        {availableTimeSlots.length > 0 && (
          <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-[#00B3B0]" />
              Horários disponíveis para agendamento ({availableTimeSlots.length})
            </h3>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {availableTimeSlots.map((slot) => (
                <div 
                  key={slot} 
                  className="text-xs font-medium text-center py-1 px-2 bg-[#00B3B0] text-white rounded"
                >
                  {slot}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agenda Médica</h1>
        <p className="text-gray-600">
          Gerenciamento de Consultas e Disponibilidade
        </p>
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'week' ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode('week')}
            className="flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            Semana
          </Button>
          <Button
            variant={viewMode === 'day' ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode('day')}
            className="flex items-center gap-1"
          >
            <CalendarIcon className="h-4 w-4" />
            Dia
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-6">
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
      
      <div className="mt-6 flex justify-center">
        <Button 
          className="bg-[#00B3B0] hover:bg-[#009E9B] flex items-center" 
          onClick={handleSaveAvailability}
        >
          <Save className="h-4 w-4 mr-2" /> Salvar Informações
        </Button>
      </div>
    </div>
  );
};

export default AgendaMedica;
