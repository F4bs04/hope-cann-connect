
import { supabase } from "@/integrations/supabase/client";

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

export const getSaldoMedicos = async () => {
  try {
    const { data, error } = await supabase
      .from('saldo_medicos')
      .select('*, medicos(nome, crm, especialidade, foto_perfil)')
      .order('saldo_total', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar saldo dos médicos:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar saldo dos médicos:", error);
    return [];
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

export const getTransacoesMedicos = async () => {
  try {
    const { data, error } = await supabase
      .from('transacoes_medicos')
      .select('*, medicos(nome)')
      .order('data_transacao', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error("Erro ao buscar transações dos médicos:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar transações dos médicos:", error);
    return [];
  }
};

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
