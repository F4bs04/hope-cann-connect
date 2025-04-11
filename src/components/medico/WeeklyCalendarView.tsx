
import React from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeeklyCalendarViewProps {
  selectedWeekStart: Date;
  prevWeek: () => void;
  nextWeek: () => void;
  renderDaysOfWeek: () => React.ReactNode;
  renderBulkActions: () => React.ReactNode;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  selectedWeekStart,
  prevWeek,
  nextWeek,
  renderDaysOfWeek,
  renderBulkActions
}) => {
  return (
    <div className="space-y-4">
      {renderBulkActions()}
      
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={prevWeek}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Semana anterior
        </Button>
        <span className="text-sm font-medium">
          {format(selectedWeekStart, "dd/MM")} - {format(addDays(selectedWeekStart, 6), "dd/MM/yyyy")}
        </span>
        <Button variant="outline" size="sm" onClick={nextWeek}>
          Próxima semana
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {renderDaysOfWeek()}
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
