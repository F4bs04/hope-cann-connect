
import { useState } from 'react';
import { format, addWeeks, subWeeks, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function useCalendarNavigation() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWeekStart, setSelectedWeekStart] = useState(new Date());
  const [selectedViewDay, setSelectedViewDay] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

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

  return {
    currentDate,
    selectedWeekStart,
    selectedViewDay,
    selectedDate,
    setCurrentDate,
    setSelectedWeekStart,
    setSelectedViewDay,
    setSelectedDate,
    nextWeek,
    prevWeek,
    nextDay,
    prevDay,
    formatWeekday
  };
}
