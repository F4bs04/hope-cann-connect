
import React from 'react';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, ChevronLeft, ChevronRight, MinusCircle, PlusCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  handleQuickSetAvailability: (day: Date, mode: 'morning' | 'afternoon' | 'all' | 'none') => void;
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
  setSelectedViewDay,
  handleQuickSetAvailability
}) => {
  const { toast } = useToast();
  const availableSlots = getAvailableSlotsForDay(selectedViewDay);
  
  // Define time range from 5 AM to 9 PM
  const allTimeSlots = [
    '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

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
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={prevDay}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Dia anterior
        </Button>
        
        <h3 className="font-medium">
          {format(selectedViewDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          {isToday(selectedViewDay) && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Hoje</span>}
        </h3>
        
        <Button variant="outline" size="sm" onClick={nextDay}>
          Próximo dia
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="font-medium">
          Disponibilidade para {format(selectedViewDay, "dd 'de' MMMM", { locale: ptBR })}
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
        <div>
          <h3 className="text-sm font-medium mb-4 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-hopecann-teal" />
            Todos os horários disponíveis (5h - 21h)
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {allTimeSlots.map((hora) => {
              const isAvailable = availableSlots.includes(hora);
              
              return (
                <TooltipProvider key={hora}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={isAvailable ? "default" : "outline"} 
                        className={`text-sm ${isAvailable 
                          ? 'bg-hopecann-teal text-white hover:bg-hopecann-teal/90'
                          : 'text-gray-700'}`}
                        onClick={() => {
                          if (isAvailable) {
                            handleRemoverHorario(selectedViewDay, hora);
                          } else {
                            handleAddHorario(hora);
                          }
                        }}
                      >
                        {hora} {isAvailable 
                          ? <MinusCircle className="h-3.5 w-3.5 ml-1" /> 
                          : <PlusCircle className="h-3.5 w-3.5 ml-1" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isAvailable ? 'Remover horário' : 'Adicionar horário'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={() => handleQuickSetAvailability(selectedViewDay, 'all')}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar informações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DayCalendarView;

