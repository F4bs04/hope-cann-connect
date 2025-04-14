
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export function useHorariosSelection() {
  const { toast } = useToast();

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      toast({
        title: "Data selecionada",
        description: `${format(date, 'EEEE, dd/MM', { locale: ptBR })}`,
      });
    }
    
    return date;
  };

  return {
    handleDateSelect
  };
}
