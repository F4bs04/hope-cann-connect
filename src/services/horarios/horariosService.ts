// Horarios service temporarily disabled due to database schema updates
export interface HorarioDisponivel {
  id: number;
  id_medico: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
}

export interface CreateHorarioData {
  id_medico: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
}

export const getHorariosDisponiveis = async () => [];
export const createHorario = async () => ({ success: false });
export const updateHorario = async () => ({ success: false });
export const deleteHorario = async () => ({ success: false });
export const getHorariosByMedico = async () => [];
export const getAvailableSlots = async () => [];