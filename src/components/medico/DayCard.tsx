
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, SunMedium, Sunset, MoreHorizontal, Check } from 'lucide-react';

interface DayCardProps {
  day: Date;
  handleToggleDayAvailability: (day: Date, isAvailable: boolean) => void;
  handleQuickSetAvailability: (day: Date, mode: 'morning' | 'afternoon' | 'all' | 'none') => void;
  formatWeekday: (date: Date) => string;
  getAvailableSlotsForDay: (date: Date) => string[];
  setSelectedViewDay: (day: Date) => void;
  setViewMode: (mode: 'week' | 'day' | 'calendar') => void;
  horariosDisponiveis: {
    manha: string[];
    tarde: string[];
  };
  setSelectedDay: (day: Date | null) => void;
  setHorarioDialogOpen: (open: boolean) => void;
  horariosConfig: Record<string, string[]>;
}

const DayCard: React.FC<DayCardProps> = ({
  day,
  handleToggleDayAvailability,
  handleQuickSetAvailability,
  formatWeekday,
  getAvailableSlotsForDay,
  setSelectedViewDay,
  setViewMode,
  horariosDisponiveis,
  setSelectedDay,
  setHorarioDialogOpen,
  horariosConfig
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const dayOfWeek = formatWeekday(day);
  const dayName = format(day, 'EEEE', { locale: ptBR });
  const dayOfMonth = format(day, 'dd/MM');
  const availableSlots = getAvailableSlotsForDay(day);
  const hasSlots = availableSlots.length > 0;

  const hasMorningSlots = availableSlots.some(slot => {
    const hour = parseInt(slot.split(':')[0]);
    return hour < 12;
  });

  const hasAfternoonSlots = availableSlots.some(slot => {
    const hour = parseInt(slot.split(':')[0]);
    return hour >= 12;
  });

  const isWeekend = day.getDay() === 0 || day.getDay() === 6;

  const viewDetailsDay = () => {
    setSelectedViewDay(day);
    setViewMode('day');
  };

  return (
    <div className={`border rounded-lg overflow-hidden bg-white hover:shadow transition-shadow ${isWeekend ? 'border-orange-200' : 'border-blue-200'}`}>
      <div
        className={`text-center p-2 cursor-pointer ${
          isWeekend ? 'bg-orange-50 text-orange-800' : 'bg-blue-50 text-blue-800'
        } border-b ${isWeekend ? 'border-orange-100' : 'border-blue-100'}`}
        onClick={viewDetailsDay}
      >
        <div className="font-medium capitalize">{dayName}</div>
        <div className="text-sm font-bold">{dayOfMonth}</div>
      </div>

      <div className="p-3">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-gray-500">Disponível</span>
          <Switch
            checked={hasSlots}
            onCheckedChange={(checked) => handleToggleDayAvailability(day, checked)}
            className="data-[state=checked]:bg-hopecann-teal"
          />
        </div>

        {hasSlots ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1">
              <Button
                variant={hasMorningSlots ? "default" : "outline"}
                size="sm"
                className={`h-7 text-xs flex items-center justify-center gap-1 ${
                  hasMorningSlots ? 'bg-blue-600 hover:bg-blue-700' : ''
                }`}
                onClick={() => {
                  if (hasMorningSlots) {
                    handleQuickSetAvailability(day, hasAfternoonSlots ? 'afternoon' : 'none');
                  } else {
                    handleQuickSetAvailability(day, hasAfternoonSlots ? 'all' : 'morning');
                  }
                }}
              >
                <SunMedium className="h-3 w-3" />
                Manhã
              </Button>
              <Button
                variant={hasAfternoonSlots ? "default" : "outline"}
                size="sm"
                className={`h-7 text-xs flex items-center justify-center gap-1 ${
                  hasAfternoonSlots ? 'bg-orange-500 hover:bg-orange-600' : ''
                }`}
                onClick={() => {
                  if (hasAfternoonSlots) {
                    handleQuickSetAvailability(day, hasMorningSlots ? 'morning' : 'none');
                  } else {
                    handleQuickSetAvailability(day, hasMorningSlots ? 'all' : 'afternoon');
                  }
                }}
              >
                <Sunset className="h-3 w-3" />
                Tarde
              </Button>
            </div>

            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-xs mt-1 flex items-center justify-center text-blue-600"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {availableSlots.length} horários
                  <MoreHorizontal className="h-3 w-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="center">
                <div className="text-xs font-medium mb-2">Horários disponíveis:</div>
                <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <div
                      key={slot}
                      className="text-xs py-1 px-2 bg-gray-100 rounded text-center"
                    >
                      {slot}
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-blue-600"
                    onClick={() => {
                      setIsPopoverOpen(false);
                      viewDetailsDay();
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-green-600"
                    onClick={() => {
                      setIsPopoverOpen(false);
                      handleQuickSetAvailability(day, 'all');
                    }}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Dia todo
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
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
