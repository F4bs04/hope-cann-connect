
import React, { useState } from 'react';
import { addDays, startOfWeek, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays, CalendarIcon, Calendar as CalendarIcon2 } from 'lucide-react';
import DayCard from './DayCard';
import WeeklyCalendarView from './WeeklyCalendarView';
import MonthCalendarView from './MonthCalendarView';
import DayCalendarView from './DayCalendarView';
import BulkActionsPanel from './BulkActionsPanel';

interface CalendarViewsProps {
  viewMode: 'week' | 'day' | 'calendar';
  setViewMode: (mode: 'week' | 'day' | 'calendar') => void;
  selectedWeekStart: Date;
  selectedViewDay: Date;
  setSelectedViewDay: (day: Date) => void;
  prevWeek: () => void;
  nextWeek: () => void;
  prevDay: () => void;
  nextDay: () => void;
  setHorarioDialogOpen: (open: boolean) => void;
  handleFastAgendamento: (data: { dia: Date; horario: string }) => void;
}

const CalendarViews: React.FC<CalendarViewsProps> = ({
  viewMode,
  setViewMode,
  selectedWeekStart,
  selectedViewDay,
  setSelectedViewDay,
  prevWeek,
  nextWeek,
  prevDay,
  nextDay,
  setHorarioDialogOpen,
  handleFastAgendamento
}) => {
  // Hoisting these values from the context, which we'll access through props
  const horariosConfig = {};
  const horariosDisponiveis = { manha: [], tarde: [] };
  const formatWeekday = (date: Date) => format(date, 'EEEE', { locale: ptBR });
  const handleToggleDayAvailability = (day: Date, isAvailable: boolean) => {};
  const handleQuickSetAvailability = (day: Date, mode: 'morning' | 'afternoon' | 'all' | 'none') => {};
  const handleRemoverHorario = (day: Date, time: string) => {};
  const getAvailableSlotsForDay = (date: Date) => [];
  const setSelectedDay = (day: Date | null) => {};
  const applyPatternToWeek = (pattern: 'workdays' | 'weekend' | 'all' | 'none', timePattern: 'morning' | 'afternoon' | 'all' | 'none') => {};
  const setQuickSetMode = (mode: 'morning' | 'afternoon' | 'all' | 'custom') => {};
  const setHorariosConfig = () => {};
  const saveAvailability = async () => true;
  const quickSetMode = 'all';
  const handleDateSelect = (date: Date | undefined) => date;

  const renderDaysOfWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(selectedWeekStart, i);
      days.push(
        <DayCard
          key={i}
          day={day}
          handleToggleDayAvailability={handleToggleDayAvailability}
          handleQuickSetAvailability={handleQuickSetAvailability}
          formatWeekday={formatWeekday}
          getAvailableSlotsForDay={getAvailableSlotsForDay}
          setSelectedViewDay={setSelectedViewDay}
          setViewMode={setViewMode}
          horariosDisponiveis={horariosDisponiveis}
          setSelectedDay={setSelectedDay}
          setHorarioDialogOpen={setHorarioDialogOpen}
          horariosConfig={horariosConfig}
        />
      );
    }
    return days;
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      {/* View Mode Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={viewMode === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('week')}
          className="flex items-center gap-1"
        >
          <CalendarDays className="h-4 w-4" />
          Semana
        </Button>
        <Button
          variant={viewMode === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('day')}
          className="flex items-center gap-1"
        >
          <CalendarIcon className="h-4 w-4" />
          Dia
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('calendar')}
          className="flex items-center gap-1"
        >
          <CalendarIcon2 className="h-4 w-4" />
          Calendário
        </Button>
      </div>

      {viewMode === 'week' && (
        <WeeklyCalendarView
          selectedWeekStart={selectedWeekStart}
          prevWeek={prevWeek}
          nextWeek={nextWeek}
          renderDaysOfWeek={renderDaysOfWeek}
          renderBulkActions={() => (
            <BulkActionsPanel
              quickSetMode={quickSetMode}
              setQuickSetMode={setQuickSetMode}
              applyPatternToWeek={applyPatternToWeek}
            />
          )}
          horariosConfig={horariosConfig}
          formatWeekday={formatWeekday}
          handleQuickSetMode={setQuickSetMode}
          applyPatternToWeek={applyPatternToWeek}
          saveAvailability={saveAvailability}
        />
      )}

      {viewMode === 'day' && (
        <DayCalendarView
          selectedViewDay={selectedViewDay}
          prevDay={prevDay}
          nextDay={nextDay}
          setViewMode={setViewMode}
          horariosDisponiveis={horariosDisponiveis}
          getAvailableSlotsForDay={getAvailableSlotsForDay}
          handleToggleDayAvailability={handleToggleDayAvailability}
          handleRemoverHorario={handleRemoverHorario}
          formatWeekday={formatWeekday}
          horariosConfig={horariosConfig}
          setHorariosConfig={setHorariosConfig}
          setSelectedViewDay={setSelectedViewDay}
          handleQuickSetAvailability={handleQuickSetAvailability}
          saveAvailability={saveAvailability}
        />
      )}

      {viewMode === 'calendar' && (
        <MonthCalendarView
          selectedDate={selectedDate}
          handleDateSelect={handleDateSelect}
          horariosConfig={horariosConfig}
          formatWeekday={formatWeekday}
          applyPatternToWeek={applyPatternToWeek}
          setViewMode={setViewMode}
        />
      )}
    </div>
  );
};

export default CalendarViews;
