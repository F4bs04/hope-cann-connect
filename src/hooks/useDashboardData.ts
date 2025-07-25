// Temporarily disabled hook
export const useDashboardData = () => {
  return { 
    data: { 
      appointments: [], 
      prescriptions: [],
      proximaConsulta: null,
      consultasPendentes: 0,
      novosDocumentos: 0
    },
    appointments: [],
    prescriptions: [],
    isLoading: false,
    error: null 
  };
};