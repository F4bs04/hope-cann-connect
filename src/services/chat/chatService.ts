
import { supabase } from '@/integrations/supabase/client';

// Interface para mensagens de chat
interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    full_name?: string;
    email?: string;
  };
}

// Interface para chat ativo
interface ActiveChat {
  id: string;
  doctor_id: string;
  patient_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  patient?: {
    id: string;
    profiles?: {
      full_name?: string;
      email?: string;
      avatar_url?: string;
    };
  };
}

// Criar ou obter chat ativo entre médico e paciente
export const verificarChatAtivo = async (doctorId: string, patientId: string) => {
  try {
    // Verificar se já existe um chat ativo na tabela active_chats
    const { data: existingChats, error } = await supabase
      .from('active_chats')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking active chat:', error);
      return null;
    }

    if (existingChats && existingChats.length > 0) {
      return existingChats[0].id;
    }

    // Se não existe, criar um novo chat ativo
    const { data: newChat, error: createError } = await supabase
      .from('active_chats')
      .insert({
        doctor_id: doctorId,
        patient_id: patientId,
        is_active: true,
        ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 dias
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating chat:', createError);
      return null;
    }

    return newChat.id;
  } catch (error) {
    console.error('Error in verificarChatAtivo:', error);
    return null;
  }
};

// Enviar mensagem
export const enviarMensagem = async (data: {
  chat_id: string;
  sender_id: string;
  message: string;
}) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: data.chat_id,
        sender_id: data.sender_id,
        message: data.message,
        is_read: false
      });

    if (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in enviarMensagem:', error);
    return { success: false, error: 'Erro inesperado ao enviar mensagem' };
  }
};

// Obter mensagens do chat
export const getMensagensChat = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMensagensChat:', error);
    return [];
  }
};

// Marcar mensagens como lidas
export const marcarMensagensComoLidas = async (chatId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('chat_id', chatId)
      .neq('sender_id', userId); // Não marcar as próprias mensagens

    if (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in marcarMensagensComoLidas:', error);
    return false;
  }
};

// Obter chats ativos do médico - CORRIGIDA
export const getChatsAtivos = async (doctorId: string) => {
  try {
    console.log('Getting active chats for doctor:', doctorId);

    // Buscar chats ativos através da tabela active_chats
    const { data: activeChats, error } = await supabase
      .from('active_chats')
      .select(`
        id,
        patient_id,
        created_at,
        updated_at,
        patients!inner(
          id,
          full_name,
          user_id
        )
      `)
      .eq('doctor_id', doctorId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error getting active chats:', error);
      return [];
    }

    if (!activeChats || activeChats.length === 0) {
      console.log('No active chats found');
      return [];
    }

    // Para cada chat ativo, buscar a última mensagem
    const chatsWithMessages = await Promise.all(
      activeChats.map(async (chat) => {
        const { data: lastMessage } = await supabase
          .from('chat_messages')
          .select('created_at')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1);

        return {
          id: chat.id,
          patient_id: chat.patient_id,
          last_message_at: lastMessage && lastMessage.length > 0 
            ? lastMessage[0].created_at 
            : chat.created_at,
          pacientes: {
            id: chat.patients.id,
            nome: chat.patients.profiles?.full_name || chat.patients.full_name || 'Paciente',
            email: chat.patients.profiles?.email || '',
            avatar: null
          },
          data_inicio: chat.created_at,
          data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
      })
    );

    console.log('Active chats with messages:', chatsWithMessages);
    return chatsWithMessages;
  } catch (error) {
    console.error('Error in getChatsAtivos:', error);
    return [];
  }
};

// Obter chats ativos do paciente
export const getChatsAtivosPaciente = async (patientId: string) => {
  try {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(`
        chat_id,
        created_at
      `)
      .like('chat_id', `%_${patientId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting patient chats:', error);
      return [];
    }

    return messages || [];
  } catch (error) {
    console.error('Error in getChatsAtivosPaciente:', error);
    return [];
  }
};

// Serviço de chat modernizado
export const chatService = {
  startChat: async (doctorId: string, patientId: string) => {
    const chatId = await verificarChatAtivo(doctorId, patientId);
    if (chatId) {
      return { success: true, chatId };
    }
    return { success: false, message: 'Erro ao iniciar chat' };
  },
  
  sendMessage: async (chatId: string, senderId: string, message: string) => {
    return await enviarMensagem({ chat_id: chatId, sender_id: senderId, message });
  },
  
  getChatMessages: async (chatId: string) => {
    const messages = await getMensagensChat(chatId);
    return { success: true, data: messages };
  },
  
  markMessageAsRead: async (chatId: string, userId: string) => {
    const success = await marcarMensagensComoLidas(chatId, userId);
    return { success };
  },
  
  getActiveChats: async (doctorId: string) => {
    const chats = await getChatsAtivos(doctorId);
    return { success: true, data: chats };
  }
};
