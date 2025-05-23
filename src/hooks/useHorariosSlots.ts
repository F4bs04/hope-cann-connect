
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { HorariosConfig } from '@/types/doctorScheduleTypes';

interface UseHorariosSlotsProps {
  selectedSlot: { day: Date, time: string } | null;
  horariosConfig: HorariosConfig;
  setHorariosConfig: React.Dispatch<React.SetStateAction<HorariosConfig>>;
}

export function useHorariosSlots({ selectedSlot, horariosConfig, setHorariosConfig }: UseHorariosSlotsProps) {
  const { toast } = useToast();

  const handleAdicionarHorario = () => {
    if (selectedSlot) {
      const diaSemana = format(selectedSlot.day, 'EEEE', { locale: ptBR }).toLowerCase() as keyof HorariosConfig;
      
      if (!horariosConfig[diaSemana].includes(selectedSlot.time)) {
        setHorariosConfig({
          ...horariosConfig,
          [diaSemana]: [...horariosConfig[diaSemana], selectedSlot.time].sort()
        });
        
        toast({
          title: "Horário adicionado",
          description: `${selectedSlot.time} adicionado para ${format(selectedSlot.day, 'EEEE', { locale: ptBR })}`,
        });
      }
    }
  };

  const handleRemoverHorario = (day: Date, time: string) => {
    const diaSemana = format(day, 'EEEE', { locale: ptBR }).toLowerCase() as keyof HorariosConfig;
    const updatedHorarios = horariosConfig[diaSemana].filter(t => t !== time);
    
    setHorariosConfig({
      ...horariosConfig,
      [diaSemana]: updatedHorarios
    });
    
    toast({
      title: "Horário removido",
      description: `${time} removido de ${format(day, 'EEEE', { locale: ptBR })}`,
    });
  };

  const handleAddSlot = (day: Date, time: string) => {
    const diaSemana = format(day, 'EEEE', { locale: ptBR }).toLowerCase() as keyof HorariosConfig;
    
    if (!horariosConfig[diaSemana].includes(time)) {
      setHorariosConfig({
        ...horariosConfig,
        [diaSemana]: [...horariosConfig[diaSemana], time].sort()
      });
      
      toast({
        title: "Horário adicionado",
        description: `${time} adicionado para ${format(day, 'EEEE', { locale: ptBR })}`,
      });
    }
  };

  return {
    handleAdicionarHorario,
    handleRemoverHorario,
    handleAddSlot
  };
}
