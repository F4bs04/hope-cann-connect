
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HorariosConfig } from '@/types/doctorScheduleTypes';
import { todosHorariosDisponiveis } from '@/mocks/doctorScheduleMockData';

export function useHorariosState() {
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

  return {
    quickSetMode,
    selectedSlot,
    selectedDay,
    horariosConfig,
    setQuickSetMode,
    setSelectedSlot,
    setSelectedDay,
    setHorariosConfig,
    getAvailableSlotsForDay
  };
}
