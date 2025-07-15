import React from 'react';
import SimpleScheduler from './SimpleScheduler';

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

const CalendarViews: React.FC<CalendarViewsProps> = () => {
  return (
    <div className="bg-card rounded-lg border p-4">
      <SimpleScheduler />
    </div>
  );
};

export default CalendarViews;
