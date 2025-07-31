import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Interface para médico baseada no schema real
interface Doctor {
  id: string;
  approved_at: string | null;
  biography: string | null;
  clinic_id: string | null;
  consultation_fee: number | null;
  cpf: string;
  created_at: string;
  crm: string;
  is_approved: boolean;
  is_available: boolean;
  specialty: string;
  updated_at: string;
  user_id: string;
  profiles?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  // Campos derivados para compatibilidade
  nome?: string;
  email?: string;
  telefone?: string;
}

// Obter todos os médicos
export const getMedicos = async (): Promise<Doctor[]> => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        profiles (
          full_name,
          email,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting doctors:', error);
      return [];
    }

    // Mapear dados para incluir campos derivados
    const mappedData = (data || []).map(doctor => ({
      ...doctor,
      nome: doctor.profiles?.full_name || 'Médico',
      email: doctor.profiles?.email,
      telefone: undefined // Campo não disponível no schema atual
    }));

    return mappedData;
  } catch (error) {
    console.error('Error in getMedicos:', error);
    return [];
  }
};

// Obter médico por ID
export const getMedicoById = async (id: string): Promise<Doctor | null> => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        profiles (
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting doctor by id:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getMedicoById:', error);
    return null;
  }
};

// Criar médico
export const createMedico = async (doctorData: Database['public']['Tables']['doctors']['Insert']) => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .insert(doctorData)
      .select()
      .single();

    if (error) {
      console.error('Error creating doctor:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in createMedico:', error);
    return { success: false, error: 'Erro inesperado ao criar médico' };
  }
};

// Atualizar médico
export const updateMedico = async (id: string, doctorData: Partial<Doctor>) => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .update(doctorData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating doctor:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in updateMedico:', error);
    return { success: false, error: 'Erro inesperado ao atualizar médico' };
  }
};

// Deletar médico (soft delete)
export const deleteMedico = async (id: string) => {
  try {
    const { error } = await supabase
      .from('doctors')
      .update({ is_available: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting doctor:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteMedico:', error);
    return { success: false, error: 'Erro inesperado ao deletar médico' };
  }
};

// Obter médicos por especialidade
export const getMedicosByEspecialidade = async (especialidade: string): Promise<Doctor[]> => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        profiles (
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('specialty', especialidade)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting doctors by specialty:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMedicosByEspecialidade:', error);
    return [];
  }
};

// Buscar médicos
export const searchMedicos = async (searchTerm: string): Promise<Doctor[]> => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        profiles (
          full_name,
          email,
          avatar_url
        )
      `)
      .or(`specialty.ilike.%${searchTerm}%,crm.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching doctors:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchMedicos:', error);
    return [];
  }
};

// Funções de saldo e transações (placeholder para futuras implementações)
export const getSaldoMedico = async (id: string) => {
  // TODO: Implementar quando sistema financeiro for desenvolvido
  return { saldo: 0, moeda: 'BRL' };
};

export const getSaldoMedicos = async () => {
  // TODO: Implementar quando sistema financeiro for desenvolvido
  return [];
};

export const getTransacoesMedico = async (id: string) => {
  // TODO: Implementar quando sistema financeiro for desenvolvido
  return [];
};

export const getTransacoesMedicos = async () => {
  // TODO: Implementar quando sistema financeiro for desenvolvido
  return [];
};