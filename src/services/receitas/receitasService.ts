import { supabase } from '@/integrations/supabase/client';

export const getReceitasByPaciente = async (patientId) => {
  const { data, error } = await supabase.from('prescriptions').select('*').eq('patient_id', patientId);
  if (error) throw error;
  return data;
};

export const createReceita = async (data) => {
  const { error } = await supabase.from('prescriptions').insert([data]);
  return { success: !error, error };
};

export const updateReceita = async (id, data) => {
  const { error } = await supabase.from('prescriptions').update(data).eq('id', id);
  return { success: !error, error };
};

export const deleteReceita = async (id) => {
  const { error } = await supabase.from('prescriptions').delete().eq('id', id);
  return { success: !error, error };
};

export const getReceitasByMedico = async (doctorId) => {
  const { data, error } = await supabase.from('prescriptions').select('*').eq('doctor_id', doctorId);
  if (error) throw error;
  return data;
};

export const getReceitas = async () => {
  const { data, error } = await supabase.from('prescriptions').select('*');
  if (error) throw error;
  return data;
};