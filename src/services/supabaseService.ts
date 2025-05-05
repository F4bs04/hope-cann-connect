
import { supabase } from "@/integrations/supabase/client";

export const getConsultas = async () => {
  try {
    const { data, error } = await supabase
      .from('consultas')
      .select('*');
    
    if (error) {
      console.error("Erro ao buscar consultas:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar consultas:", error);
    return [];
  }
};

export const getPacientes = async () => {
  try {
    const { data, error } = await supabase
      .from('pacientes_app')
      .select('*');
    
    if (error) {
      console.error("Erro ao buscar pacientes:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return [];
  }
};

export const getReceitas = async () => {
  try {
    const { data, error } = await supabase
      .from('receitas_app')
      .select('*, pacientes_app(nome)')
      .order('data', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar receitas:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar receitas:", error);
    return [];
  }
};

export const getProntuarios = async () => {
  try {
    const { data, error } = await supabase
      .from('prontuarios')
      .select('*');
    
    if (error) {
      console.error("Erro ao buscar prontuários:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar prontuários:", error);
    return [];
  }
};

export const createConsulta = async (consultaData: any) => {
  try {
    const { data, error } = await supabase
      .from('consultas')
      .insert([consultaData])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar consulta:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao criar consulta:", error);
    return null;
  }
};

export const createReceita = async (receitaData: any) => {
  try {
    const { data, error } = await supabase
      .from('receitas_app')
      .insert([receitaData])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar receita:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao criar receita:", error);
    return null;
  }
};

export const createProntuario = async (prontuarioData: any) => {
  try {
    const { data, error } = await supabase
      .from('prontuarios')
      .insert([prontuarioData])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar prontuário:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao criar prontuário:", error);
    return null;
  }
};

export const getDocumentUrl = async (path: string) => {
  try {
    const { data } = await supabase.storage
      .from('documentos_medicos')
      .getPublicUrl(path);
    
    return data.publicUrl;
  } catch (error) {
    console.error("Erro ao obter URL do documento:", error);
    return null;
  }
};

export const downloadDocument = async (filePath: string, fileName: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('documentos_medicos')
      .download(filePath);
    
    if (error) {
      console.error("Erro ao fazer download do documento:", error);
      return false;
    }
    
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Erro ao fazer download do documento:", error);
    return false;
  }
};

export const getSaldoMedico = async (medicoId: number) => {
  try {
    const { data, error } = await supabase
      .from('saldo_medicos')
      .select('*')
      .eq('id_medico', medicoId)
      .single();
    
    if (error) {
      console.error("Erro ao buscar saldo do médico:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar saldo do médico:", error);
    return null;
  }
};

export const getTransacoesMedico = async (medicoId: number) => {
  try {
    const { data, error } = await supabase
      .from('transacoes_medicos')
      .select('*')
      .eq('id_medico', medicoId)
      .order('data_transacao', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar transações do médico:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar transações do médico:", error);
    return [];
  }
};

export const createAtestado = async (atestadoData: any) => {
  try {
    const { data, error } = await supabase
      .from('atestados')
      .insert([atestadoData])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar atestado:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao criar atestado:", error);
    return null;
  }
};

export const createLaudo = async (laudoData: any) => {
  try {
    const { data, error } = await supabase
      .from('laudos')
      .insert([laudoData])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar laudo:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao criar laudo:", error);
    return null;
  }
};

export const createPedidoExame = async (pedidoExameData: any) => {
  try {
    const { data, error } = await supabase
      .from('pedidos_exame')
      .insert([pedidoExameData])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar pedido de exame:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao criar pedido de exame:", error);
    return null;
  }
};

// Funções para templates de exame
export const getTemplatesExame = async (medicoId: number | null) => {
  if (!medicoId) return [];
  
  try {
    const { data, error } = await supabase
      .from('templates_exame')
      .select('*')
      .eq('id_medico', medicoId)
      .order('frequencia_uso', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar templates de exame:', error);
    return [];
  }
};

export const saveTemplateExame = async (template: any) => {
  try {
    const { data, error } = await supabase
      .from('templates_exame')
      .insert([template])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao salvar template de exame:', error);
    throw error;
  }
};

export const updateTemplateUsage = async (templateId: number) => {
  try {
    // Primeiro, obter o valor atual de frequencia_uso
    const { data: template, error: getError } = await supabase
      .from('templates_exame')
      .select('frequencia_uso')
      .eq('id', templateId)
      .single();
      
    if (getError) throw getError;
    
    // Incrementar manualmente
    const novaFrequencia = (template?.frequencia_uso || 0) + 1;
    
    // Atualizar o template com o novo valor
    const { data, error } = await supabase
      .from('templates_exame')
      .update({ frequencia_uso: novaFrequencia })
      .eq('id', templateId)
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar uso do template:', error);
    return null;
  }
};

export const deleteTemplateExame = async (templateId: number) => {
  try {
    const { error } = await supabase
      .from('templates_exame')
      .delete()
      .eq('id', templateId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao excluir template de exame:', error);
    return false;
  }
};

// Implementação da função verifyClinicPassword que estava faltando
export const verifyClinicPassword = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('verify_clinic_password', {
      p_email: email,
      p_password: password
    });
    
    if (error) {
      console.error("Erro ao verificar senha da clínica:", error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error("Erro ao verificar senha da clínica:", error);
    return false;
  }
};

// Funções mock para evitar erros de tipos - essas funções estão sendo referenciadas em outros arquivos
export const createPaciente = async (pacienteData: any) => {
  console.error("Função createPaciente não implementada");
  return null;
};

export const verificarChatAtivo = async (medicoId: number, pacienteId: number) => {
  console.error("Função verificarChatAtivo não implementada");
  return false;
};

export const enviarMensagem = async (mensagemData: any) => {
  console.error("Função enviarMensagem não implementada");
  return null;
};

export const getMensagensChat = async (medicoId: number, pacienteId: number) => {
  console.error("Função getMensagensChat não implementada");
  return [];
};

export const marcarMensagensComoLidas = async (medicoId: number, pacienteId: number, remetenteTipo: string) => {
  console.error("Função marcarMensagensComoLidas não implementada");
  return true;
};

export const getChatsAtivos = async (medicoId: number) => {
  console.error("Função getChatsAtivos não implementada");
  return [];
};

export const getChatsAtivosPaciente = async (pacienteId: number) => {
  console.error("Função getChatsAtivosPaciente não implementada");
  return [];
};
