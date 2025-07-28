import { supabase } from '@/integrations/supabase/client';

export const getPacientes = async () => {
  try {
    const { data, error } = await supabase
      .from('patients')
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
      console.error('Error getting patients:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPacientes:', error);
    return [];
  }
};

export const getPacienteById = async (id) => {
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createPaciente = async (data) => {
  const { error } = await supabase.from('patients').insert([data]);
  return { success: !error, error };
};

export const updatePaciente = async (id, data) => {
  const { error } = await supabase.from('patients').update(data).eq('id', id);
  return { success: !error, error };
};

export const deletePaciente = async (id) => {
  const { error } = await supabase.from('patients').delete().eq('id', id);
  return { success: !error, error };
};

export const searchPacientes = async (query) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        profiles (
          full_name,
          email,
          avatar_url
        )
      `)
      .or(`profiles.full_name.ilike.%${query}%,profiles.email.ilike.%${query}%,cpf.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching patients:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchPacientes:', error);
    return [];
  }
};

export const getSaldoPacientes = async () => {
  // TODO: Implementar quando sistema financeiro for desenvolvido
  return [];
};