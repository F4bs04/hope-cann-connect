
import React from 'react';
import { addDays, startOfWeek } from 'date-fns';
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
  selectedDate: Date | undefined;
  quickSetMode: 'morning' | 'afternoon' | 'all' | 'custom';
  horariosConfig: Record<string, string[]>;
  horariosDisponiveis: { manha: string[]; tarde: string[] };
  handleDateSelect: (date: Date | undefined) => void;
  applyPatternToWeek: (pattern: 'workdays' | 'weekend' | 'all' | 'none', timePattern: 'morning' | 'afternoon' | 'all' | 'none') => void;
  handleToggleDayAvailability: (day: Date, isAvailable: boolean) => void;
  handleQuickSetAvailability: (day: Date, mode: 'morning' | 'afternoon' | 'all' | 'none') => void;
  handleRemoverHorario: (day: Date, time: string) => void;
  formatWeekday: (date: Date) => string;
  prevWeek: () => void;
  nextWeek: () => void;
  prevDay: () => void;
  nextDay: () => void;
  setQuickSetMode: (mode: 'morning' | 'afternoon' | 'all' | 'custom') => void;
  setSelectedViewDay: (day: Date) => void;
  setSelectedDay: (day: Date | null) => void;
  setHorarioDialogOpen: (open: boolean) => void;
  setHorariosConfig: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  getAvailableSlotsForDay: (date: Date) => string[];
}

const CalendarViews: React.FC<CalendarViewsProps> = ({
  viewMode,
  setViewMode,
  selectedWeekStart,
  selectedViewDay,
  selectedDate,
  quickSetMode,
  horariosConfig,
  horariosDisponiveis,
  handleDateSelect,
  applyPatternToWeek,
  handleToggleDayAvailability,
  handleQuickSetAvailability,
  handleRemoverHorario,
  formatWeekday,
  prevWeek,
  nextWeek,
  prevDay,
  nextDay,
  setQuickSetMode,
  setSelectedViewDay,
  setSelectedDay,
  setHorarioDialogOpen,
  setHorariosConfig,
  getAvailableSlotsForDay
}) => {

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

  const renderBulkActions = () => (
    <BulkActionsPanel
      quickSetMode={quickSetMode}
      setQuickSetMode={setQuickSetMode}
      applyPatternToWeek={applyPatternToWeek}
    />
  );

  return (
    <div className="bg-white rounded-lg border p-4">
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
          renderBulkActions={renderBulkActions}
          horariosConfig={horariosConfig}
          formatWeekday={formatWeekday}
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
