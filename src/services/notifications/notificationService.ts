import { supabase } from '@/integrations/supabase/client';

// Interface para notificações
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'document' | 'appointment' | 'system' | 'chat';
  document_type?: 'receita' | 'atestado' | 'prescricao' | 'prontuario';
  document_id?: string;
  doctor_name?: string;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
  read_at?: string;
}

// Criar notificação para novo documento médico
export const createDocumentNotification = async (
  patientId: string,
  doctorName: string,
  documentType: 'receita' | 'atestado' | 'prescricao' | 'prontuario',
  documentId: string
) => {
  try {
    const typeLabels = {
      receita: 'Nova Receita',
      atestado: 'Novo Atestado',
      prescricao: 'Nova Prescrição',
      prontuario: 'Novo Prontuário'
    };

    const typeMessages = {
      receita: `Dr(a). ${doctorName} criou uma nova receita médica para você.`,
      atestado: `Dr(a). ${doctorName} criou um novo atestado médico para você.`,
      prescricao: `Dr(a). ${doctorName} criou uma nova prescrição para você.`,
      prontuario: `Dr(a). ${doctorName} atualizou seu prontuário médico.`
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: patientId,
        title: typeLabels[documentType],
        message: typeMessages[documentType],
        notification_type: 'document',
        document_type: documentType,
        document_id: documentId,
        doctor_name: doctorName,
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar notificação:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return { success: false, error: 'Erro inesperado ao criar notificação' };
  }
};

// Buscar notificações do usuário
export const getUserNotifications = async (userId: string, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return { success: false, error: 'Erro inesperado ao buscar notificações', data: [] };
  }
};

// Marcar notificação como lida
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return { success: false, error: 'Erro inesperado ao marcar notificação' };
  }
};

// Marcar todas as notificações como lidas
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    return { success: false, error: 'Erro inesperado ao marcar notificações' };
  }
};

// Contar notificações não lidas
export const getUnreadNotificationsCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    return { success: false, count: 0, error: 'Erro inesperado ao contar notificações' };
  }
};

// Deletar notificação
export const deleteNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Erro ao deletar notificação:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    return { success: false, error: 'Erro inesperado ao deletar notificação' };
  }
};

// Criar notificação para agendamento
export const createAppointmentNotification = async (
  userId: string,
  userType: 'patient' | 'doctor',
  appointmentData: {
    patientName?: string;
    doctorName?: string;
    date: string;
    time: string;
  }
) => {
  try {
    const title = userType === 'patient' 
      ? 'Consulta Agendada' 
      : 'Nova Consulta Agendada';
    
    const message = userType === 'patient'
      ? `Sua consulta com Dr(a). ${appointmentData.doctorName} foi agendada para ${appointmentData.date} às ${appointmentData.time}.`
      : `Nova consulta agendada com ${appointmentData.patientName} para ${appointmentData.date} às ${appointmentData.time}.`;

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        notification_type: 'appointment',
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar notificação de agendamento:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar notificação de agendamento:', error);
    return { success: false, error: 'Erro inesperado ao criar notificação' };
  }
};
