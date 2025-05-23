
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Check, X, Calendar, Save } from 'lucide-react';

interface MonthCalendarViewProps {
  selectedDate: Date | undefined;
  handleDateSelect: (date: Date | undefined) => void;
  horariosConfig: Record<string, string[]>;
  formatWeekday: (date: Date) => string;
  applyPatternToWeek: (pattern: 'workdays' | 'weekend' | 'all' | 'none', timePattern: 'morning' | 'afternoon' | 'all' | 'none') => void;
  setViewMode: (mode: 'week' | 'day' | 'calendar') => void;
}

const MonthCalendarView: React.FC<MonthCalendarViewProps> = ({
  selectedDate,
  handleDateSelect,
  horariosConfig,
  formatWeekday,
  applyPatternToWeek,
  setViewMode
}) => {
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

export default MonthCalendarView;

