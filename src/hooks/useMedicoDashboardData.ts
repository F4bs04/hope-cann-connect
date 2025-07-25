// Temporarily disabled hook
export const useMedicoDashboardData = () => {
  return { 
    data: {
      consultasHoje: 0,
      consultasTotal: 0,
      novosReceitas: 0,
      saldoDisponivel: 0,
      proximaConsulta: null,
      pacientesUnicos: 0,
      pacientesAtivos: 0,
      receitaGerada: 0,
      alertas: [],
      consultasSemana: [],
      consultasMes: [],
      consultasRecentes: []
    },
    isLoading: false,
    error: null
  };
};