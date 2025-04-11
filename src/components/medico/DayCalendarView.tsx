
import React from 'react';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, MinusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';

interface DayCalendarViewProps {
  selectedViewDay: Date;
  prevDay: () => void;
  nextDay: () => void;
  setViewMode: (mode: 'week' | 'day' | 'calendar') => void;
  horariosDisponiveis: {
    manha: string[];
    tarde: string[];
  };
  getAvailableSlotsForDay: (date: Date) => string[];
  handleToggleDayAvailability: (day: Date, isAvailable: boolean) => void;
  handleRemoverHorario: (day: Date, time: string) => void;
  formatWeekday: (date: Date) => string;
  horariosConfig: Record<string, string[]>;
  setHorariosConfig: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  setSelectedViewDay: React.Dispatch<React.SetStateAction<Date>>;
}

const DayCalendarView: React.FC<DayCalendarViewProps> = ({
  selectedViewDay,
  prevDay,
  nextDay,
  setViewMode,
  horariosDisponiveis,
  getAvailableSlotsForDay,
  handleToggleDayAvailability,
  handleRemoverHorario,
  formatWeekday,
  horariosConfig,
  setHorariosConfig,
  setSelectedViewDay
}) => {
  const { toast } = useToast();
  const availableSlots = getAvailableSlotsForDay(selectedViewDay);

  const handleAddHorario = (hora: string) => {
    const diaSemana = formatWeekday(selectedViewDay).toLowerCase() as keyof typeof horariosConfig;
    setHorariosConfig({
      ...horariosConfig,
      [diaSemana]: [...horariosConfig[diaSemana], hora].sort()
    });
    toast({
      title: "Horário adicionado",
      description: `${hora} adicionado para ${format(selectedViewDay, 'EEEE, dd/MM', { locale: ptBR })}`,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={prevDay}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Dia anterior
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="font-medium">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {format(selectedViewDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              {isToday(selectedViewDay) && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Hoje</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <CalendarComponent
              mode="single"
              selected={selectedViewDay}
              onSelect={(date) => date && setSelectedViewDay(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Button variant="outline" size="sm" onClick={nextDay}>
          Próximo dia
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="mt-4">
        <div className="mb-6 flex justify-between items-center">
          <div className="font-medium">
            Disponibilidade para {format(selectedViewDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{availableSlots.length > 0 ? `${availableSlots.length} horários disponíveis` : 'Indisponível'}</span>
            <Switch 
              checked={availableSlots.length > 0}
              onCheckedChange={(checked) => handleToggleDayAvailability(selectedViewDay, checked)}
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium mb-4 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-hopecann-teal" />
              Período da manhã
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {horariosDisponiveis.manha.map((hora) => {
                const isAvailable = availableSlots.includes(hora);
                return (
                  <Button 
                    key={hora} 
                    variant={isAvailable ? "default" : "outline"} 
                    className={`text-sm ${isAvailable ? 'bg-hopecann-teal text-white hover:bg-hopecann-teal/90' : 'text-gray-700'}`}
                    title={isAvailable ? "Remover horário" : "Adicionar horário"}
                    onClick={() => {
                      if (isAvailable) {
                        handleRemoverHorario(selectedViewDay, hora);
                      } else {
                        handleAddHorario(hora);
                      }
                    }}
                  >
                    {hora} {isAvailable && <MinusCircle className="h-3.5 w-3.5 ml-1" />}
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium mb-4 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-hopecann-green" />
              Período da tarde
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {horariosDisponiveis.tarde.map((hora) => {
                const isAvailable = availableSlots.includes(hora);
                return (
                  <Button 
                    key={hora} 
                    variant={isAvailable ? "default" : "outline"} 
                    className={`text-sm ${isAvailable ? 'bg-hopecann-green text-white hover:bg-hopecann-green/90' : 'text-gray-700'}`}
                    title={isAvailable ? "Remover horário" : "Adicionar horário"}
                    onClick={() => {
                      if (isAvailable) {
                        handleRemoverHorario(selectedViewDay, hora);
                      } else {
                        handleAddHorario(hora);
                      }
                    }}
                  >
                    {hora} {isAvailable && <MinusCircle className="h-3.5 w-3.5 ml-1" />}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon className="h-4 w-4" />
            Voltar para calendário
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setViewMode('week')}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Visualização semanal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DayCalendarView;
