import { supabase } from '@/integrations/supabase/client';

export const getLaudosByPaciente = async (patientId) => {
  const { data, error } = await supabase.from('documents').select('*').eq('patient_id', patientId).eq('document_type', 'medical_report');
  if (error) throw error;
  return data;
};

export const createLaudo = async (data) => {
  const { error } = await supabase.from('documents').insert([data]);
  return { success: !error, error };
};

export const updateLaudo = async (id, data) => {
  const { error } = await supabase.from('documents').update(data).eq('id', id);
  return { success: !error, error };
};

export const deleteLaudo = async (id) => {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  return { success: !error, error };
};