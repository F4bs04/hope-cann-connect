import { useHorariosState } from './useHorariosState';
import { useHorariosAvailability } from './useHorariosAvailability';
import { useHorariosSlots } from './useHorariosSlots';
import { useHorariosSelection } from './useHorariosSelection';
import { horariosDisponiveis, todosHorariosDisponiveis } from '@/mocks/doctorScheduleMockData';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUserInfo } from './useCurrentUserInfo';

export function useHorarios() {
  const { toast } = useToast();
  const { userInfo } = useCurrentUserInfo();
  
  const {
    quickSetMode,
    selectedSlot,
    selectedDay,
    horariosConfig,
    setQuickSetMode,
    setSelectedSlot,
    setSelectedDay,
    setHorariosConfig,
    getAvailableSlotsForDay
  } = useHorariosState();

  const {
    handleQuickSetAvailability,
    applyPatternToWeek,
    handleToggleDayAvailability
  } = useHorariosAvailability({
    horariosConfig,
    setHorariosConfig
  });

  const {
    handleAdicionarHorario,
    handleRemoverHorario,
    handleAddSlot
  } = useHorariosSlots({
    selectedSlot,
    horariosConfig,
    setHorariosConfig
  });

  const { dateSelected, handleDateSelect: baseHandleDateSelect } = useHorariosSelection();

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDay(date);
      baseHandleDateSelect(date);
    }
    return date;
  };

  const saveAvailability = async () => {
    try {
      if (!userInfo.medicoId) {
        toast({
          variant: "destructive",
          title: "Não autorizado",
          description: "Você precisa estar logado como médico para salvar os horários.",
        });
        return false;
      }

      await supabase
        .from('horarios_disponiveis')
        .delete()
        .eq('id_medico', userInfo.medicoId);

      const scheduleEntries = [];
      for (const [diaSemana, horarios] of Object.entries(horariosConfig)) {
        if (horarios.length > 0) {
          let startHour = horarios[0];
          let endHour = '';
          
          for (let i = 0; i < horarios.length; i++) {
            const currentHour = horarios[i];
            
            if (i === horarios.length - 1 || 
                parseInt(horarios[i+1].split(':')[0]) - parseInt(currentHour.split(':')[0]) > 1) {
              
              const currentHourNum = parseInt(currentHour.split(':')[0]);
              endHour = `${(currentHourNum + 1).toString().padStart(2, '0')}:00`;
              
              scheduleEntries.push({
                id_medico: userInfo.medicoId,
                dia_semana: diaSemana,
                hora_inicio: startHour,
                hora_fim: endHour
              });
              
              if (i < horarios.length - 1) {
                startHour = horarios[i+1];
              }
            }
          }
        }
      }

      if (scheduleEntries.length > 0) {
        const { error: insertError } = await supabase
          .from('horarios_disponiveis')
          .insert(scheduleEntries);

        if (insertError) {
          throw insertError;
        }
      }

      const { error: statusError } = await supabase
        .from('medicos')
        .update({ status_disponibilidade: true })
        .eq('id', userInfo.medicoId);

      if (statusError) {
        throw statusError;
      }

      toast({
        title: "Informações salvas",
        description: "Sua disponibilidade foi atualizada com sucesso e já está visível para os pacientes.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao salvar disponibilidade:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar sua disponibilidade. Tente novamente.",
      });
      return false;
    }
  };

  return {
    quickSetMode,
    selectedSlot,
    selectedDay,
    horariosConfig,
    horariosDisponiveis,
    todosHorariosDisponiveis,
    
    setQuickSetMode,
    setSelectedSlot,
    setSelectedDay,
    setHorariosConfig,
    
    getAvailableSlotsForDay,
    handleQuickSetAvailability,
    applyPatternToWeek,
    handleAdicionarHorario,
    handleRemoverHorario,
    handleToggleDayAvailability,
    handleDateSelect,
    handleAddSlot,
    saveAvailability
  };
}
