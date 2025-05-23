
import React, { useState } from 'react';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  MinusCircle, 
  PlusCircle, 
  Save,
  Calendar as CalendarIcon,
  SunMedium,
  Sunset,
  Check as CheckIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

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
  saveAvailability: () => Promise<boolean>;
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
  handleQuickSetAvailability,
  saveAvailability
}) => {
  const { toast } = useToast();
  const availableSlots = getAvailableSlotsForDay(selectedViewDay);
  const [isSaving, setIsSaving] = useState(false);
  const [consultDuration, setConsultDuration] = useState('30');
  
  // Define time ranges for easier selection
  const timeRanges = [
    { label: 'Manhã (8h - 12h)', start: '08:00', end: '12:00', type: 'morning' },
    { label: 'Almoço (12h - 14h)', start: '12:00', end: '14:00', type: 'lunch' },
    { label: 'Tarde (14h - 18h)', start: '14:00', end: '18:00', type: 'afternoon' },
    { label: 'Noite (18h - 21h)', start: '18:00', end: '21:00', type: 'evening' }
  ];
  
  // Define time range from 5 AM to 9 PM
  const allTimeSlots = [
    '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const handleAddHorario = (hora: string) => {
    const diaSemana = formatWeekday(selectedViewDay).toLowerCase() as keyof typeof horariosConfig;
    if (!horariosConfig[diaSemana].includes(hora)) {
      setHorariosConfig({
        ...horariosConfig,
        [diaSemana]: [...horariosConfig[diaSemana], hora].sort()
      });
      toast({
        title: "Horário adicionado",
        description: `${hora} adicionado para ${format(selectedViewDay, 'EEEE, dd/MM', { locale: ptBR })}`,
      });
    }
  };

  const handleAddTimeRange = (start: string, end: string) => {
    const diaSemana = formatWeekday(selectedViewDay).toLowerCase() as keyof typeof horariosConfig;
    const newSlots = [];
    
    // Generate slots for this range
    for (let i = parseInt(start.split(':')[0]); i < parseInt(end.split(':')[0]); i++) {
      const hour = `${i.toString().padStart(2, '0')}:00`;
      if (!horariosConfig[diaSemana].includes(hour)) {
        newSlots.push(hour);
      }
    }
    
    if (newSlots.length > 0) {
      setHorariosConfig({
        ...horariosConfig,
        [diaSemana]: [...horariosConfig[diaSemana], ...newSlots].sort()
      });
      
      toast({
        title: "Intervalo adicionado",
        description: `Horários de ${start} até ${end} adicionados`,
      });
    }
  };

  const handleSaveAvailability = async () => {
    setIsSaving(true);
    try {
      await saveAvailability();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDurationChange = (value: string) => {
    setConsultDuration(value);
    toast({
      title: "Duração da consulta atualizada",
      description: `Suas consultas agora terão ${value} minutos.`,
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
      
      {/* Duração da consulta */}
      <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-hopecann-teal" />
            <span className="text-sm font-medium">Duração da consulta:</span>
          </div>
          <Select value={consultDuration} onValueChange={handleDurationChange}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Duração" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutos</SelectItem>
              <SelectItem value="30">30 minutos</SelectItem>
              <SelectItem value="45">45 minutos</SelectItem>
              <SelectItem value="60">1 hora</SelectItem>
              <SelectItem value="90">1h30min</SelectItem>
              <SelectItem value="120">2 horas</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
      
      {/* Quick time range selection */}
      <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100">
        <h4 className="text-sm font-medium text-blue-700 mb-2">Configuração rápida de intervalos</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs flex items-center justify-center text-blue-700 border-blue-200 hover:bg-blue-100"
            onClick={() => handleAddTimeRange('08:00', '12:00')}
          >
            <SunMedium className="h-3.5 w-3.5 mr-1" />
            Manhã (8h - 12h)
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs flex items-center justify-center text-orange-700 border-orange-200 hover:bg-orange-100"
            onClick={() => handleAddTimeRange('14:00', '18:00')}
          >
            <Sunset className="h-3.5 w-3.5 mr-1" />
            Tarde (14h - 18h)
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs flex items-center justify-center text-purple-700 border-purple-200 hover:bg-purple-100"
            onClick={() => handleAddTimeRange('18:00', '21:00')}
          >
            <Clock className="h-3.5 w-3.5 mr-1" />
            Noite (18h - 21h)
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs flex items-center justify-center text-green-700 border-green-200 hover:bg-green-100"
            onClick={() => {
              handleAddTimeRange('08:00', '12:00');
              handleAddTimeRange('14:00', '18:00');
            }}
          >
            <CheckIcon className="h-3.5 w-3.5 mr-1" />
            Dia todo (8h - 18h)
          </Button>
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
        
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            className="flex-1 flex items-center justify-center"
            onClick={() => setViewMode('week')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Ver semana
          </Button>
          <Button 
            variant="default" 
            className="flex-1 flex items-center justify-center bg-hopecann-teal hover:bg-hopecann-teal/90"
            onClick={handleSaveAvailability}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DayCalendarView;
