
import { supabase } from "@/integrations/supabase/client";

export const verificarChatAtivo = async (medicoId: number, pacienteId: number) => {
  try {
    const { data, error } = await supabase
      .from('chat_ativo')
      .select('*')
      .eq('id_medico', medicoId)
      .eq('id_paciente', pacienteId)
      .eq('ativo', true)
      .maybeSingle();
    
    if (error) {
      console.error("Erro ao verificar chat ativo:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Erro ao verificar chat ativo:", error);
    return false;
  }
};

export const enviarMensagem = async (mensagemData: any) => {
  try {
    const { data, error } = await supabase
      .from('mensagens_chat')
      .insert([mensagemData])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao enviar mensagem:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return null;
  }
};

export const getMensagensChat = async (medicoId: number, pacienteId: number) => {
  try {
    const { data, error } = await supabase
      .from('mensagens_chat')
      .select('*')
      .eq('id_medico', medicoId)
      .eq('id_paciente', pacienteId)
      .order('data_envio', { ascending: true });
    
    if (error) {
      console.error("Erro ao buscar mensagens:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return [];
  }
};

export const marcarMensagensComoLidas = async (medicoId: number, pacienteId: number, remetenteTipo: string) => {
  try {
    // Atualiza mensagens onde o destinatário é o tipo fornecido
    const tipoRemetente = remetenteTipo === 'medico' ? 'paciente' : 'medico';
    
    const { error } = await supabase
      .from('mensagens_chat')
      .update({ lida: true })
      .eq('id_medico', medicoId)
      .eq('id_paciente', pacienteId)
      .eq('remetente_tipo', tipoRemetente);
    
    if (error) {
      console.error("Erro ao marcar mensagens como lidas:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao marcar mensagens como lidas:", error);
    return false;
  }
};

export const getChatsAtivos = async (medicoId: number) => {
  try {
    const { data, error } = await supabase
      .from('chat_ativo')
      .select(`
        *,
        pacientes_app(*),
        consultas(*)
      `)
      .eq('id_medico', medicoId)
      .eq('ativo', true);
    
    if (error) {
      console.error("Erro ao buscar chats ativos:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar chats ativos:", error);
    return [];
  }
};

export const getChatsAtivosPaciente = async (pacienteId: number) => {
  try {
    const { data, error } = await supabase
      .from('chat_ativo')
      .select(`
        *,
        medicos(*),
        consultas(*)
      `)
      .eq('id_paciente', pacienteId)
      .eq('ativo', true);
    
    if (error) {
      console.error("Erro ao buscar chats ativos do paciente:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar chats ativos do paciente:", error);
    return [];
  }
};
