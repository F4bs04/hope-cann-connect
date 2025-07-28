import { supabase } from '@/integrations/supabase/client';
import { createDocumentNotification } from '@/services/notifications/notificationService';

export const getProntuariosByPaciente = async (patientId) => {
  const { data, error } = await supabase.from('medical_records').select('*').eq('patient_id', patientId);
  if (error) throw error;
  return data;
};

export const createProntuario = async (data) => {
  try {
    const { data: newProntuario, error } = await supabase
      .from('medical_records')
      .insert([data])
      .select(`
        *,
        patients!inner(user_id, profiles!inner(full_name)),
        doctors!inner(profiles!inner(full_name))
      `)
      .single();

    if (error) {
      console.error('Erro ao criar prontuário:', error);
      return { success: false, error };
    }

    // Criar notificação para o paciente
    if (newProntuario && newProntuario.patients?.user_id) {
      const doctorName = newProntuario.doctors?.profiles?.full_name || 'Médico';
      await createDocumentNotification(
        newProntuario.patients.user_id,
        doctorName,
        'prontuario',
        newProntuario.id.toString()
      );
    }

    return { success: true, data: newProntuario };
  } catch (error) {
    console.error('Erro inesperado ao criar prontuário:', error);
    return { success: false, error: 'Erro inesperado ao criar prontuário' };
  }
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