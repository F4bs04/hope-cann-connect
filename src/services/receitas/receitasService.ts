import { supabase } from '@/integrations/supabase/client';
import { createDocumentNotification } from '@/services/notifications/notificationService';

export const getReceitasByPaciente = async (patientId) => {
  const { data, error } = await supabase.from('prescriptions').select('*').eq('patient_id', patientId);
  if (error) throw error;
  return data;
};

export const createReceita = async (data) => {
  try {
    const { data: newReceita, error } = await supabase
      .from('prescriptions')
      .insert([data])
      .select(`
        *,
        patients!inner(user_id, profiles!inner(full_name)),
        doctors!inner(profiles!inner(full_name))
      `)
      .single();

    if (error) {
      console.error('Erro ao criar receita:', error);
      return { success: false, error };
    }

    // Criar notificação para o paciente
    if (newReceita && newReceita.patients?.user_id) {
      const doctorName = newReceita.doctors?.profiles?.full_name || 'Médico';
      await createDocumentNotification(
        newReceita.patients.user_id,
        doctorName,
        'receita',
        newReceita.id.toString()
      );
    }

    return { success: true, data: newReceita };
  } catch (error) {
    console.error('Erro inesperado ao criar receita:', error);
    return { success: false, error: 'Erro inesperado ao criar receita' };
  }
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