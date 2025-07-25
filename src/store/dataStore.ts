// Data store temporarily disabled due to database schema updates
import { create } from 'zustand';

export interface Consulta {
  id: number;
  data_hora: string;
  motivo: string;
  status: string;
  tipo_consulta: string;
}

interface DataState {
  consultas: Consulta[];
  consultasLoading: boolean;
  fetchConsultas: (filters?: any) => Promise<void>;
  addConsulta: (consulta: Omit<Consulta, 'id'>) => Promise<Consulta>;
}

export const useDataStore = create<DataState>((set) => ({
  consultas: [],
  consultasLoading: false,
  
  fetchConsultas: async () => {
    set({ consultasLoading: true });
    // Temporarily disabled
    set({ consultas: [], consultasLoading: false });
  },
  
  addConsulta: async () => {
    // Temporarily disabled
    return { id: 1, data_hora: '', motivo: '', status: '', tipo_consulta: '' };
  }
}));