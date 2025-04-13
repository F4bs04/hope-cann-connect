
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

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
  
  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <div 
        className="text-center p-2 cursor-pointer hover:bg-gray-50 border-b"
        onClick={() => {
          setSelectedViewDay(day);
          setViewMode('day');
        }}
      >
        <div className="font-medium">
          {format(day, 'EEEE', { locale: ptBR })}
        </div>
        <div className="text-sm">
          {format(day, 'dd/MM')}
        </div>
      </div>
      
      <div className="p-2 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Disponibilidade:</span>
          <Switch 
            checked={timeSlotsCount > 0}
            onCheckedChange={(checked) => handleToggleDayAvailability(day, checked)}
            size="sm"
          />
        </div>
        
        {timeSlotsCount > 0 ? (
          <div className="space-y-2">
            <div className="flex gap-1">
              <Button 
                variant={hasMorningSlots && !hasAfternoonSlots ? "default" : "outline"} 
                size="sm" 
                className="flex-1 h-7 text-xs"
                onClick={() => handleQuickSetAvailability(day, 'morning')}
              >
                Manhã
              </Button>
              <Button 
                variant={!hasMorningSlots && hasAfternoonSlots ? "default" : "outline"} 
                size="sm" 
                className="flex-1 h-7 text-xs"
                onClick={() => handleQuickSetAvailability(day, 'afternoon')}
              >
                Tarde
              </Button>
              <Button 
                variant={hasMorningSlots && hasAfternoonSlots ? "default" : "outline"} 
                size="sm" 
                className="flex-1 h-7 text-xs"
                onClick={() => handleQuickSetAvailability(day, 'all')}
              >
                Todos
              </Button>
            </div>
            
            <div className="text-xs text-center text-gray-500">
              {timeSlotsCount} horários • {setSelectedDay && setHorarioDialogOpen && (
                <button 
                  className="text-blue-500 hover:underline" 
                  onClick={() => {
                    setSelectedDay(day);
                    setHorarioDialogOpen(true);
                  }}
                >
                  Detalhes
                </button>
              )}
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
