
import { useHorariosState } from './useHorariosState';
import { useHorariosAvailability } from './useHorariosAvailability';
import { useHorariosSlots } from './useHorariosSlots';
import { useHorariosSelection } from './useHorariosSelection';
import { horariosDisponiveis, todosHorariosDisponiveis } from '@/mocks/doctorScheduleMockData';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useHorarios() {
  const { toast } = useToast();
  
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

  // Wrapper para manter a API original
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDay(date);
      baseHandleDateSelect(date);
    }
    return date;
  };
  
  // Nova função para salvar a disponibilidade do médico no Supabase
  const saveAvailability = async () => {
    try {
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Não autorizado",
          description: "Você precisa estar logado para salvar os horários.",
        });
        return false;
      }

      // Get the doctor's ID from the medicos table
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (userError) {
        throw userError;
      }

      const { data: doctorData, error: doctorError } = await supabase
        .from('medicos')
        .select('id')
        .eq('id_usuario', userData.id)
        .single();

      if (doctorError) {
        throw doctorError;
      }

      const doctorId = doctorData.id;

      // Delete existing schedule entries for the doctor
      await supabase
        .from('horarios_disponiveis')
        .delete()
        .eq('id_medico', doctorId);

      // Insert new schedule entries based on horariosConfig
      const scheduleEntries = [];
      for (const [diaSemana, horarios] of Object.entries(horariosConfig)) {
        if (horarios.length > 0) {
          // Group consecutive hours
          let startHour = horarios[0];
          let endHour = '';
          
          for (let i = 0; i < horarios.length; i++) {
            const currentHour = horarios[i];
            
            // If this is the last hour or there's a gap to the next hour
            if (i === horarios.length - 1 || 
                parseInt(horarios[i+1].split(':')[0]) - parseInt(currentHour.split(':')[0]) > 1) {
              
              // Calculate end hour (current hour + 1)
              const currentHourNum = parseInt(currentHour.split(':')[0]);
              endHour = `${(currentHourNum + 1).toString().padStart(2, '0')}:00`;
              
              // Add entry for this time block
              scheduleEntries.push({
                id_medico: doctorId,
                dia_semana: diaSemana,
                hora_inicio: startHour,
                hora_fim: endHour
              });
              
              // If not the last hour, start a new block with the next hour
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

      // Update doctor's availability status
      const { error: statusError } = await supabase
        .from('medicos')
        .update({ status_disponibilidade: true })
        .eq('id', doctorId);

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
    // State
    quickSetMode,
    selectedSlot,
    selectedDay,
    horariosConfig,
    horariosDisponiveis,
    todosHorariosDisponiveis,
    
    // Setters
    setQuickSetMode,
    setSelectedSlot,
    setSelectedDay,
    setHorariosConfig,
    
    // Functions
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
