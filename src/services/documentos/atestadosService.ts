import { supabase } from '@/integrations/supabase/client';
import { createDocumentNotification } from '@/services/notifications/notificationService';

export const getAtestadosByPaciente = async (patientId) => {
  const { data, error } = await supabase.from('documents').select('*').eq('patient_id', patientId).eq('document_type', 'certificate');
  if (error) throw error;
  return data;
};

export const createAtestado = async (data) => {
  try {
    const { data: newAtestado, error } = await supabase
      .from('documents')
      .insert([data])
      .select(`
        *,
        patients!inner(user_id, profiles!inner(full_name)),
        doctors!inner(profiles!inner(full_name))
      `)
      .single();

    if (error) {
      console.error('Erro ao criar atestado:', error);
      return { success: false, error };
    }

    // Criar notificação para o paciente
    if (newAtestado && newAtestado.patients?.user_id) {
      const doctorName = newAtestado.doctors?.profiles?.full_name || 'Médico';
      await createDocumentNotification(
        newAtestado.patients.user_id,
        doctorName,
        'atestado',
        newAtestado.id.toString()
      );
    }

    return { success: true, data: newAtestado };
  } catch (error) {
    console.error('Erro inesperado ao criar atestado:', error);
    return { success: false, error: 'Erro inesperado ao criar atestado' };
  }
};

export const updateAtestado = async (id, data) => {
  const { error } = await supabase.from('documents').update(data).eq('id', id);
  return { success: !error, error };
};

export const deleteAtestado = async (id) => {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  return { success: !error, error };
};