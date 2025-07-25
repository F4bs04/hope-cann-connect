// Temporarily disabled hook
export const usePacientesData = () => {
  return { 
    pacientes: [],
    isLoading: false,
    error: null,
    searchTerm: '',
    setSearchTerm: () => {},
    addPaciente: () => Promise.resolve({ success: false }),
    updatePaciente: () => Promise.resolve({ success: false }),
    refetch: () => {}
  };
};