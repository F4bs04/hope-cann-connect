// Temporarily disabled hook
export interface DiaHorario {
  dia: string;
  horaInicio: string;
  horaFim: string;
}

export const useMedicoRegistro = () => {
  return { 
    isLoading: false,
    error: null,
    step: 1,
    formData: {},
    handleSubmit: () => Promise.resolve({ success: false }),
    nextStep: () => {},
    prevStep: () => {},
    updateFormData: () => {}
  };
};