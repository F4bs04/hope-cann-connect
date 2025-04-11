import React from 'react';
import { addDays } from 'date-fns';
import WeeklyCalendarView from './WeeklyCalendarView';
import DayCalendarView from './DayCalendarView';
import MonthCalendarView from './MonthCalendarView';
import BulkActionsPanel from './BulkActionsPanel';
import DayCard from './DayCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

interface CalendarViewsProps {
  viewMode: 'week' | 'day' | 'calendar';
  setViewMode: (mode: 'week' | 'day' | 'calendar') => void;
  selectedWeekStart: Date;
  selectedViewDay: Date;
  selectedDate: Date | undefined;
  quickSetMode: 'morning' | 'afternoon' | 'all' | 'custom';
  horariosConfig: Record<string, string[]>;
  horariosDisponiveis: {
    manha: string[];
    tarde: string[];
  };
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
  setSelectedViewDay: React.Dispatch<React.SetStateAction<Date>>;
  setSelectedDay: React.Dispatch<React.SetStateAction<Date | null>>;
  setHorarioDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
      days.push(day);
    }
    
    return days.map((day, index) => (
      <DayCard
        key={index}
        day={day}
        formatWeekday={formatWeekday}
        horariosConfig={horariosConfig}
        horariosDisponiveis={horariosDisponiveis}
        handleToggleDayAvailability={handleToggleDayAvailability}
        handleQuickSetAvailability={handleQuickSetAvailability}
        setSelectedDay={setSelectedDay}
        setHorarioDialogOpen={setHorarioDialogOpen}
        setSelectedViewDay={setSelectedViewDay}
        setViewMode={setViewMode}
      />
    ));
  };

  const renderBulkActions = () => (
    <BulkActionsPanel 
      quickSetMode={quickSetMode}
      setQuickSetMode={setQuickSetMode}
      applyPatternToWeek={applyPatternToWeek}
    />
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        Gerenciar disponibilidade
      </h2>
      
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar on the left */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Calendário</h3>
            <MonthCalendarView
              selectedDate={selectedDate}
              handleDateSelect={handleDateSelect}
              horariosConfig={horariosConfig}
              formatWeekday={formatWeekday}
              applyPatternToWeek={applyPatternToWeek}
              setViewMode={setViewMode}
            />
          </div>
          
          {/* Available slots on the right */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Horários Disponíveis</h3>
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
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalendarViews;
