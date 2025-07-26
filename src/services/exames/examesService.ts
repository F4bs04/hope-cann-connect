import { supabase } from '@/integrations/supabase/client';

export const getPedidosExameByPaciente = async (patientId) => {
  const { data, error } = await supabase.from('documents').select('*').eq('patient_id', patientId).eq('document_type', 'exam_request');
  if (error) throw error;
  return data;
};

export const createPedidoExame = async (data) => {
  const { error } = await supabase.from('documents').insert([data]);
  return { success: !error, error };
};

export const updatePedidoExame = async (id, data) => {
  const { error } = await supabase.from('documents').update(data).eq('id', id);
  return { success: !error, error };
};

export const deletePedidoExame = async (id) => {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  return { success: !error, error };
};

export const getTemplatesExame = async (doctorId) => {
  const { data, error } = await supabase.from('exam_templates').select('*').eq('doctor_id', doctorId);
  if (error) throw error;
  return data;
};

export const saveTemplateExame = async (data) => {
  const { error } = await supabase.from('exam_templates').insert([data]);
  return { success: !error, error };
};

export const updateTemplateUsage = async (id) => {
  const { error } = await supabase.from('exam_templates').update({ usage_count: supabase.raw('usage_count + 1') }).eq('id', id);
  return { success: !error, error };
};

export const deleteTemplateExame = async (id) => {
  const { error } = await supabase.from('exam_templates').delete().eq('id', id);
  return { success: !error, error };
};