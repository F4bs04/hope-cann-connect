
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useState, useCallback } from 'react';

export function useHorariosSelection() {
  const { toast } = useToast();
  const [dateSelected, setDateSelected] = useState<Date | null>(null);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date && (!dateSelected || date.getTime() !== dateSelected.getTime())) {
      setDateSelected(date);
      toast({
        title: "Data selecionada",
        description: `${format(date, 'EEEE, dd/MM', { locale: ptBR })}`,
      });
    }
    
    return date;
  }, [dateSelected, toast]);

  return {
    dateSelected,
    handleDateSelect
  };
}
