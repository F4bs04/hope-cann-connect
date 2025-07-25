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
    adicionarHorario: async (dia: string, horaInicio: string, horaFim: string) => Promise.resolve(false),
    removerHorario: async (id: string) => Promise.resolve(false)
  };
};