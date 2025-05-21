import { supabase } from "@/integrations/supabase/client";
import { DoctorInfo } from '@/types/prescription'; // Precisamos do tipo DoctorInfo

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
    console.log('Salvando template:', template);
    const { data, error } = await supabase
      .from('templates_exame')
      .insert([template])
      .select();
      
    if (error) {
      console.error('Erro ao salvar template de exame:', error);
      throw error;
    }
    
    console.log('Template salvo com sucesso:', data);
    return data[0];
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

export const getMedicoDetailsById = async (medicoId: number): Promise<DoctorInfo | null> => {
  try {
    const { data: medicoData, error: medicoError } = await supabase
      .from('medicos')
      .select(`
        nome,
        crm,
        especialidade,
        telefone,
        foto_perfil,
        id_clinica,
        clinicas (
          nome,
          endereco
        )
      `)
      .eq('id', medicoId)
      .single();

    if (medicoError) {
      console.error("Erro ao buscar detalhes do médico:", medicoError);
      return null;
    }

    if (!medicoData) {
      console.error("Médico não encontrado:", medicoId);
      return null;
    }
    
    // Ajustar para o formato DoctorInfo
    // @ts-ignore
    const clinica = medicoData.clinicas; // Supabase retorna a relação como um objeto ou array

    return {
      name: medicoData.nome || 'Nome Indisponível',
      crm: medicoData.crm || 'CRM Indisponível',
      specialty: medicoData.especialidade || 'Especialidade Indisponível',
      // @ts-ignore
      clinicName: clinica?.nome || 'Clínica Desconhecida',
      // @ts-ignore
      clinicAddress: clinica?.endereco || '',
      phone: medicoData.telefone || '',
      clinicLogoUrl: medicoData.foto_perfil || '', // Usando foto_perfil como logo placeholder
    };

  } catch (error) {
    console.error("Erro ao buscar detalhes do médico:", error);
    return null;
  }
};
