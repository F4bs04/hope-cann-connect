
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SunMedium, Sunset, Clock, CalendarDays } from 'lucide-react';

interface DayCardProps {
  day: Date;
  formatWeekday: (date: Date) => string;
  handleToggleDayAvailability: (day: Date, isAvailable: boolean) => void;
  handleQuickSetAvailability: (day: Date, mode: 'morning' | 'afternoon' | 'all' | 'none') => void;
  setSelectedViewDay: (day: Date) => void;
  setViewMode: (mode: 'week' | 'day' | 'calendar') => void;
  getAvailableSlotsForDay: (date: Date) => string[];
  horariosDisponiveis?: {
    manha: string[];
    tarde: string[];
  };
  setSelectedDay?: (day: Date | null) => void;
  setHorarioDialogOpen?: (open: boolean) => void;
  horariosConfig?: Record<string, string[]>;
}

const DayCard: React.FC<DayCardProps> = ({
  day,
  formatWeekday,
  handleToggleDayAvailability,
  handleQuickSetAvailability,
  setSelectedViewDay,
  setViewMode,
  getAvailableSlotsForDay,
  horariosDisponiveis = {
    manha: ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
    tarde: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']
  },
  setSelectedDay,
  setHorarioDialogOpen,
  horariosConfig
}) => {
  const diaSemana = formatWeekday(day).toLowerCase();
  const availableSlots = getAvailableSlotsForDay(day);
  const timeSlotsCount = availableSlots.length || 0;
  const hasMorningSlots = availableSlots.some(slot => horariosDisponiveis.manha.includes(slot)) || false;
  const hasAfternoonSlots = availableSlots.some(slot => horariosDisponiveis.tarde.includes(slot)) || false;
  
  const dayOfWeek = format(day, 'EEEE', { locale: ptBR });
  const dayOfMonth = format(day, 'dd');
  
  return (
    <div className="border rounded-md overflow-hidden bg-white hover:shadow transition-shadow">
      <div 
        className={`text-center p-2 cursor-pointer border-b ${
          (day.getDay() === 0 || day.getDay() === 6) ? 'bg-orange-50' : 'bg-blue-50'
        }`}
        onClick={() => {
          setSelectedViewDay(day);
          setViewMode('day');
        }}
      >
        <div className="font-medium capitalize">{dayOfWeek}</div>
        <div className="text-sm font-bold">{dayOfMonth}/{format(day, 'MM')}</div>
      </div>
      
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Disponível:</span>
          <Switch 
            checked={timeSlotsCount > 0}
            onCheckedChange={(checked) => handleToggleDayAvailability(day, checked)}
            size="sm"
          />
        </div>
        
        {timeSlotsCount > 0 ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1">
              <Button 
                variant={hasMorningSlots ? "default" : "outline"} 
                size="sm" 
                className={`h-7 text-xs flex items-center gap-1 ${hasMorningSlots ? 'bg-blue-600' : ''}`}
                onClick={() => handleQuickSetAvailability(day, 'morning')}
              >
                <SunMedium className="h-3 w-3" />
                Manhã
              </Button>
              <Button 
                variant={hasAfternoonSlots ? "default" : "outline"} 
                size="sm" 
                className={`h-7 text-xs flex items-center gap-1 ${hasAfternoonSlots ? 'bg-orange-500' : ''}`}
                onClick={() => handleQuickSetAvailability(day, 'afternoon')}
              >
                <Sunset className="h-3 w-3" />
                Tarde
              </Button>
            </div>
            
            <div className="flex justify-center items-center">
              <button 
                className="text-xs text-blue-600 hover:underline flex items-center gap-1" 
                onClick={() => {
                  if (setSelectedDay && setHorarioDialogOpen) {
                    setSelectedDay(day);
                    setHorarioDialogOpen(true);
                  }
                }}
              >
                <Clock className="h-3 w-3" />
                <span>{timeSlotsCount} horários</span>
              </button>
            </div>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full h-7 text-xs"
            onClick={() => handleQuickSetAvailability(day, 'all')}
          >
            Disponibilizar
          </Button>
        )}
      </div>
    </div>
  );
};

export default DayCard;
