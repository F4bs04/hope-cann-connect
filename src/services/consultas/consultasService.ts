// Consultas service temporarily disabled due to database schema updates
export const getConsultas = async () => [];
export const getConsultaById = async () => null;
export const createConsulta = async () => ({ success: false });
export const updateConsulta = async () => ({ success: false });
export const deleteConsulta = async () => ({ success: false });
export const getConsultasByMedico = async () => [];
export const getConsultasByPaciente = async () => [];

export const consultasService = {
  getConsultas: async () => ({ success: false, data: [], message: 'Temporarily disabled' }),
  createConsulta: async () => ({ success: false, message: 'Temporarily disabled' }),
  updateConsulta: async () => ({ success: false, message: 'Temporarily disabled' }),
  deleteConsulta: async () => ({ success: false, message: 'Temporarily disabled' })
};