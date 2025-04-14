
import { useHorariosState } from './useHorariosState';
import { useHorariosAvailability } from './useHorariosAvailability';
import { useHorariosSlots } from './useHorariosSlots';
import { useHorariosSelection } from './useHorariosSelection';
import { horariosDisponiveis, todosHorariosDisponiveis } from '@/mocks/doctorScheduleMockData';

export function useHorarios() {
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

  const { handleDateSelect: baseHandleDateSelect } = useHorariosSelection();

  // Wrapper to maintain the original API
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDay(date);
      baseHandleDateSelect(date);
    }
    return date;
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
    handleAddSlot
  };
}
