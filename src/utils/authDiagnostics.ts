// Auth diagnostics temporarily disabled due to database schema updates
export const runAuthDiagnostics = async (email: string) => {
  return {
    authData: null,
    medicoData: null,
    pacienteData: null,
    errors: ['Diagnostics temporarily disabled'],
    warnings: []
  };
};