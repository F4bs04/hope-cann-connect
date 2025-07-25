// Temporarily disabled hook
export interface DiaHorario {
  dia: string;
  horaInicio: string;
  horaFim: string;
}

export const useMedicoRegistro = () => {
  return { 
    form: null,
    isLoading: false,
    error: null,
    step: 1,
    formData: {},
    userInfo: null,
    fotoPreview: null,
    certificadoNome: '',
    termoDialogOpen: false,
    horarios: [],
    handleFileChange: () => {},
    handleTelefoneChange: () => {},
    handleCRMChange: () => {},
    onSubmit: () => Promise.resolve({ success: false }),
    setHorarios: () => {},
    setTermoDialogOpen: () => {},
    setCertificadoNome: () => {},
    handleSubmit: () => Promise.resolve({ success: false }),
    nextStep: () => {},
    prevStep: () => {},
    updateFormData: () => {}
  };
};