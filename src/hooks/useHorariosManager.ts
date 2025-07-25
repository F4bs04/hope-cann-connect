// Temporarily disabled hook
export const useHorariosManager = () => {
  return { 
    horarios: [],
    loading: false,
    saving: false,
    isLoading: false,
    error: null,
    createHorario: () => {},
    updateHorario: () => {},
    deleteHorario: () => {},
    loadHorarios: () => {},
    adicionarHorario: () => {},
    removerHorario: () => {}
  };
};