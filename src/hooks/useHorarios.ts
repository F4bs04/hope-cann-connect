
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { HorariosConfig } from '@/types/doctorScheduleTypes';
import { horariosDisponiveis, todosHorariosDisponiveis } from '@/mocks/doctorScheduleMockData';

export function useHorarios() {
  const { toast } = useToast();
  const [quickSetMode, setQuickSetMode] = useState<'morning' | 'afternoon' | 'all' | 'custom'>('all');
  const [selectedSlot, setSelectedSlot] = useState<{day: Date, time: string} | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [horariosConfig, setHorariosConfig] = useState<HorariosConfig>({
    segunda: todosHorariosDisponiveis,
    terca: todosHorariosDisponiveis,
    quarta: todosHorariosDisponiveis,
    quinta: todosHorariosDisponiveis,
    sexta: todosHorariosDisponiveis,
    sabado: todosHorariosDisponiveis,
    domingo: todosHorariosDisponiveis
  });

  const getAvailableSlotsForDay = (date: Date) => {
    const diaSemana = format(date, 'EEEE', { locale: ptBR }).toLowerCase() as keyof HorariosConfig;
    return horariosConfig[diaSemana] || [];
  };

  const handleQuickSetAvailability = (day: Date, mode: 'morning' | 'afternoon' | 'all' | 'none') => {
    const diaSemana = format(day, 'EEEE', { locale: ptBR }).toLowerCase() as keyof HorariosConfig;
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
      const day = new Date();
      day.setDate(day.getDate() - day.getDay() + i);
      days.push(day);
    }
    
    const newConfig = { ...horariosConfig };
    
    days.forEach(day => {
      const dayName = format(day, 'EEEE', { locale: ptBR }).toLowerCase() as keyof HorariosConfig;
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

  const handleAdicionarHorario = () => {
    if (selectedSlot) {
      const diaSemana = format(selectedSlot.day, 'EEEE', { locale: ptBR }).toLowerCase() as keyof HorariosConfig;
      
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
      
      setSelectedSlot(null);
    }
  };

  const handleRemoverHorario = (day: Date, time: string) => {
    const diaSemana = format(day, 'EEEE', { locale: ptBR }).toLowerCase() as keyof HorariosConfig;
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
    const diaSemana = format(day, 'EEEE', { locale: ptBR }).toLowerCase() as keyof HorariosConfig;
    
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
      setSelectedDay(date);
      
      toast({
        title: "Data selecionada",
        description: `${format(date, 'EEEE, dd/MM', { locale: ptBR })}`,
      });
    }
  };

  const handleAddSlot = (day: Date, time: string) => {
    setSelectedSlot({day, time});
    
    // Call handleAdicionarHorario directly after setting the selected slot
    const diaSemana = format(day, 'EEEE', { locale: ptBR }).toLowerCase() as keyof HorariosConfig;
    
    if (!horariosConfig[diaSemana].includes(time)) {
      setHorariosConfig({
        ...horariosConfig,
        [diaSemana]: [...horariosConfig[diaSemana], time].sort()
      });
      
      toast({
        title: "Horário adicionado",
        description: `${time} adicionado para ${format(day, 'EEEE', { locale: ptBR })}`,
      });
    }
  };

  return {
    quickSetMode,
    selectedSlot,
    selectedDay,
    horariosConfig,
    horariosDisponiveis,
    todosHorariosDisponiveis,
    setQuickSetMode,
    setSelectedSlot,
    setSelectedDay,
    setHorariosConfig,
    getAvailableSlotsForDay,
    handleQuickSetAvailability,
    applyPatternToWeek,
    handleAdicionarHorario,
    handleRemoverHorario,
    handleToggleDayAvailability,
    handleDateSelect,
    handleAddSlot
  };
}
