import { supabase } from '@/integrations/supabase/client';

export const getProntuariosByPaciente = async (patientId) => {
  const { data, error } = await supabase.from('medical_records').select('*').eq('patient_id', patientId);
  if (error) throw error;
  return data;
};

export const createProntuario = async (data) => {
  const { error } = await supabase.from('medical_records').insert([data]);
  return { success: !error, error };
};

export const updateProntuario = async (id, data) => {
  const { error } = await supabase.from('medical_records').update(data).eq('id', id);
  return { success: !error, error };
};

export const deleteProntuario = async (id) => {
  const { error } = await supabase.from('medical_records').delete().eq('id', id);
  return { success: !error, error };
};

export const getProntuariosByMedico = async (doctorId) => {
  const { data, error } = await supabase.from('medical_records').select('*').eq('doctor_id', doctorId);
  if (error) throw error;
  return data;
};

export const getProntuarioById = async (id) => {
  const { data, error } = await supabase.from('medical_records').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const getProntuarios = async () => {
  const { data, error } = await supabase.from('medical_records').select('*');
  if (error) throw error;
  return data;
};