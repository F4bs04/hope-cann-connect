import { supabase } from '@/integrations/supabase/client';

export const getPacientes = async () => {
  const { data, error } = await supabase.from('patients').select('*');
  if (error) throw error;
  return data;
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
  const { data, error } = await supabase.from('patients').select('*').ilike('nome', `%${query}%`);
  if (error) throw error;
  return data;
};

export const getSaldoPacientes = async () => {
  // Exemplo: buscar saldo em outra tabela se existir
  return [];
};