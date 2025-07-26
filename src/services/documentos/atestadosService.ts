import { supabase } from '@/integrations/supabase/client';

export const getAtestadosByPaciente = async (patientId) => {
  const { data, error } = await supabase.from('documents').select('*').eq('patient_id', patientId).eq('document_type', 'certificate');
  if (error) throw error;
  return data;
};

export const createAtestado = async (data) => {
  const { error } = await supabase.from('documents').insert([data]);
  return { success: !error, error };
};

export const updateAtestado = async (id, data) => {
  const { error } = await supabase.from('documents').update(data).eq('id', id);
  return { success: !error, error };
};

export const deleteAtestado = async (id) => {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  return { success: !error, error };
};