// Temporarily disabled hook
export const usePacienteProfileUpdate = ({ pacienteId, onUpdatePaciente, setIsEditing }: any) => {
  return { 
    isLoading: false,
    error: null,
    updateProfile: () => Promise.resolve({ success: false }),
    submitProfileUpdate: async (data: any, paciente: any) => Promise.resolve({ success: false })
  };
};