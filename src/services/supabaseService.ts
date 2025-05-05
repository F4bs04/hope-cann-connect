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
      .from('receitas')
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
      .from('receitas')
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
      .from('transacoes_medico')
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
    const { data, error } = await supabase
      .from('templates_exame')
      .update({ frequencia_uso: supabase.rpc('increment', { x: 1 }) })
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

// Adicionar função para criar função de incremento no supabase caso ainda não exista
export const setupIncrementFunction = async () => {
  try {
    const { error } = await supabase.rpc('increment', { x: 1 });
    
    // Se a função não existir, vamos criá-la
    if (error && error.message.includes('does not exist')) {
      await supabase.rpc('create_increment_function');
    }
  } catch (error) {
    console.error('Error setting up increment function:', error);
  }
};

// Chamar esta função ao inicializar a aplicação
setupIncrementFunction();
