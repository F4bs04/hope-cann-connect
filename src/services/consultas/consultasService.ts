import { supabase } from '@/integrations/supabase/client';

export const getConsultas = async () => {
  const { data, error } = await supabase.from('appointments').select('*');
  if (error) throw error;
  return data;
};

export const getConsultaById = async (id) => {
  const { data, error } = await supabase.from('appointments').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createConsulta = async (data) => {
  const { error } = await supabase.from('appointments').insert([data]);
  return { success: !error, error };
};

export const updateConsulta = async (id, data) => {
  const { error } = await supabase.from('appointments').update(data).eq('id', id);
  return { success: !error, error };
};

export const deleteConsulta = async (id) => {
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  return { success: !error, error };
};

export const getConsultasByMedico = async (doctorId) => {
  const { data, error } = await supabase.from('appointments').select('*').eq('doctor_id', doctorId);
  if (error) throw error;
  return data;
};

export const getConsultasByPaciente = async (patientId) => {
  const { data, error } = await supabase.from('appointments').select('*').eq('patient_id', patientId);
  if (error) throw error;
  return data;
};