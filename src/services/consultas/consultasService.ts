// Consultas service temporarily disabled due to database schema updates
export const getConsultas = async () => [];
export const getConsultaById = async (id: any) => null;
export const createConsulta = async (data: any) => ({ success: false, data: null, error: 'Disabled' });
export const updateConsulta = async (id: any, data: any) => ({ success: false });
export const deleteConsulta = async (id: any) => ({ success: false });
export const getConsultasByMedico = async (id: any) => [];
export const getConsultasByPaciente = async (id: any) => [];

export const consultasService = {
  getConsultas: async () => ({ success: false, data: [], message: 'Temporarily disabled' }),
  createConsulta: async () => ({ success: false, message: 'Temporarily disabled' }),
  updateConsulta: async () => ({ success: false, message: 'Temporarily disabled' }),
  deleteConsulta: async () => ({ success: false, message: 'Temporarily disabled' })
};