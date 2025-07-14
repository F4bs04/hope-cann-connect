import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

// Interfaces compartilhadas
interface Consulta {
  id: number;
  data_hora: string;
  motivo: string;
  status: string;
  tipo_consulta: string;
  observacoes?: string;
  valor_consulta?: number;
  id_medico?: number;
  id_paciente?: number;
  id_clinica?: number;
}

interface Medico {
  id: number;
  nome: string;
  crm: string;
  especialidade: string;
  telefone: string;
  email?: string;
  aprovado: boolean;
  foto_perfil?: string;
  valor_por_consulta?: number;
}

interface Paciente {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  data_nascimento: string;
  cpf?: string;
  endereco?: string;
  genero?: string;
  condicao_medica?: string;
}

interface DataState {
  // Cache de dados
  consultas: Consulta[];
  medicos: Medico[];
  pacientes: Paciente[];
  
  // Estados de loading específicos
  consultasLoading: boolean;
  medicosLoading: boolean;
  pacientesLoading: boolean;
  
  // Timestamps para controle de cache
  consultasLastFetch: number;
  medicosLastFetch: number;
  pacientesLastFetch: number;
  
  // Ações para consultas
  fetchConsultas: (medicoId?: number, pacienteId?: number, force?: boolean) => Promise<void>;
  addConsulta: (consulta: Omit<Consulta, 'id'>) => Promise<Consulta | null>;
  updateConsulta: (id: number, updates: Partial<Omit<Consulta, 'id'>>) => Promise<void>;
  deleteConsulta: (id: number) => Promise<void>;
  
  // Ações para médicos
  fetchMedicos: (clinicaId?: number, force?: boolean) => Promise<void>;
  updateMedico: (id: number, updates: Partial<Omit<Medico, 'id'>>) => Promise<void>;
  
  // Ações para pacientes
  fetchPacientes: (force?: boolean) => Promise<void>;
  addPaciente: (paciente: Omit<Paciente, 'id'>) => Promise<Paciente | null>;
  updatePaciente: (id: number, updates: Partial<Omit<Paciente, 'id'>>) => Promise<void>;
  
  // Helpers
  getConsultasByMedico: (medicoId: number) => Consulta[];
  getConsultasByPaciente: (pacienteId: number) => Consulta[];
  getMedicoById: (id: number) => Medico | undefined;
  getPacienteById: (id: number) => Paciente | undefined;
  
  // Limpar cache
  clearCache: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useDataStore = create<DataState>((set, get) => ({
  // Estado inicial
  consultas: [],
  medicos: [],
  pacientes: [],
  consultasLoading: false,
  medicosLoading: false,
  pacientesLoading: false,
  consultasLastFetch: 0,
  medicosLastFetch: 0,
  pacientesLastFetch: 0,

  // Buscar consultas
  fetchConsultas: async (medicoId?: number, pacienteId?: number, force = false) => {
    const state = get();
    const now = Date.now();
    
    if (!force && now - state.consultasLastFetch < CACHE_DURATION) {
      return; // Usar cache
    }

    set({ consultasLoading: true });
    
    try {
      let query = supabase
        .from('consultas')
        .select(`
          *,
          medicos!inner(nome, especialidade),
          pacientes!inner(nome, email)
        `)
        .order('data_hora', { ascending: false });

      if (medicoId) {
        query = query.eq('id_medico', medicoId);
      }
      
      if (pacienteId) {
        query = query.eq('id_paciente', pacienteId);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ 
        consultas: data || [],
        consultasLastFetch: now,
      });
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
    } finally {
      set({ consultasLoading: false });
    }
  },

  // Adicionar consulta
  addConsulta: async (consulta: Omit<Consulta, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .insert([consulta])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        consultas: [data, ...state.consultas],
      }));

      return data;
    } catch (error) {
      console.error('Erro ao adicionar consulta:', error);
      return null;
    }
  },

  // Atualizar consulta
  updateConsulta: async (id: number, updates: Partial<Omit<Consulta, 'id'>>) => {
    try {
      const { error } = await supabase
        .from('consultas')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        consultas: state.consultas.map(c => 
          c.id === id ? { ...c, ...updates } : c
        ),
      }));
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error);
    }
  },

  // Deletar consulta
  deleteConsulta: async (id: number) => {
    try {
      const { error } = await supabase
        .from('consultas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        consultas: state.consultas.filter(c => c.id !== id),
      }));
    } catch (error) {
      console.error('Erro ao deletar consulta:', error);
    }
  },

  // Buscar médicos
  fetchMedicos: async (clinicaId?: number, force = false) => {
    const state = get();
    const now = Date.now();
    
    if (!force && now - state.medicosLastFetch < CACHE_DURATION) {
      return; // Usar cache
    }

    set({ medicosLoading: true });
    
    try {
      let query = supabase
        .from('medicos')
        .select(`
          *,
          usuarios!inner(email)
        `)
        .order('nome');

      if (clinicaId) {
        query = query.eq('id_clinica', clinicaId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const medicos = data?.map(m => ({
        ...m,
        email: m.usuarios?.email,
      })) || [];

      set({ 
        medicos,
        medicosLastFetch: now,
      });
    } catch (error) {
      console.error('Erro ao buscar médicos:', error);
    } finally {
      set({ medicosLoading: false });
    }
  },

  // Atualizar médico
  updateMedico: async (id: number, updates: Partial<Omit<Medico, 'id'>>) => {
    try {
      const { error } = await supabase
        .from('medicos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        medicos: state.medicos.map(m => 
          m.id === id ? { ...m, ...updates } : m
        ),
      }));
    } catch (error) {
      console.error('Erro ao atualizar médico:', error);
    }
  },

  // Buscar pacientes
  fetchPacientes: async (force = false) => {
    const state = get();
    const now = Date.now();
    
    if (!force && now - state.pacientesLastFetch < CACHE_DURATION) {
      return; // Usar cache
    }

    set({ pacientesLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .order('nome');

      if (error) throw error;

      set({ 
        pacientes: data || [],
        pacientesLastFetch: now,
      });
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      set({ pacientesLoading: false });
    }
  },

  // Adicionar paciente
  addPaciente: async (paciente: Omit<Paciente, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .insert([paciente])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        pacientes: [data, ...state.pacientes],
      }));

      return data;
    } catch (error) {
      console.error('Erro ao adicionar paciente:', error);
      return null;
    }
  },

  // Atualizar paciente
  updatePaciente: async (id: number, updates: Partial<Omit<Paciente, 'id'>>) => {
    try {
      const { error } = await supabase
        .from('pacientes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        pacientes: state.pacientes.map(p => 
          p.id === id ? { ...p, ...updates } : p
        ),
      }));
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
    }
  },

  // Helpers
  getConsultasByMedico: (medicoId: number) => {
    return get().consultas.filter(c => c.id_medico === medicoId);
  },

  getConsultasByPaciente: (pacienteId: number) => {
    return get().consultas.filter(c => c.id_paciente === pacienteId);
  },

  getMedicoById: (id: number) => {
    return get().medicos.find(m => m.id === id);
  },

  getPacienteById: (id: number) => {
    return get().pacientes.find(p => p.id === id);
  },

  // Limpar cache
  clearCache: () => {
    set({
      consultas: [],
      medicos: [],
      pacientes: [],
      consultasLastFetch: 0,
      medicosLastFetch: 0,
      pacientesLastFetch: 0,
    });
  },
}));