import { supabase } from "@/integrations/supabase/client";

export interface HorarioDisponivel {
  id: number;
  id_medico: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
}

export interface CreateHorarioData {
  id_medico: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
}

// Buscar horários disponíveis de um médico
export const getHorariosDisponiveis = async (medicoId: number) => {
  try {
    const { data, error } = await supabase
      .from('horarios_disponiveis')
      .select('*')
      .eq('id_medico', medicoId)
      .order('dia_semana')
      .order('hora_inicio');
    
    if (error) {
      console.error("Erro ao buscar horários disponíveis:", error);
      return { data: [], error };
    }
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Erro ao buscar horários disponíveis:", error);
    return { data: [], error: { message: "Erro interno do servidor" } };
  }
};

// Criar novo horário disponível
export const createHorarioDisponivel = async (horarioData: CreateHorarioData) => {
  console.log("[createHorarioDisponivel] Criando horário:", horarioData);
  
  try {
    const { data, error } = await supabase
      .from('horarios_disponiveis')
      .insert([horarioData])
      .select()
      .single();
    
    if (error) {
      console.error("[createHorarioDisponivel] Erro ao criar horário:", error);
      return { data: null, error };
    }
    
    console.log("[createHorarioDisponivel] Horário criado com sucesso:", data);
    return { data, error: null };
  } catch (error: any) {
    console.error("[createHorarioDisponivel] Exceção:", error);
    return { data: null, error: { message: error.message } };
  }
};

// Atualizar horário disponível
export const updateHorarioDisponivel = async (id: number, horarioData: Partial<CreateHorarioData>) => {
  try {
    const { data, error } = await supabase
      .from('horarios_disponiveis')
      .update(horarioData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao atualizar horário:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Erro ao atualizar horário:", error);
    return { data: null, error: { message: error.message } };
  }
};

// Deletar horário disponível
export const deleteHorarioDisponivel = async (id: number) => {
  try {
    const { error } = await supabase
      .from('horarios_disponiveis')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Erro ao deletar horário:", error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Erro ao deletar horário:", error);
    return { success: false, error: { message: error.message } };
  }
};

// Verificar se um médico está disponível em determinado horário
export const checkDoctorAvailability = async (
  medicoId: number, 
  dataHora: string,
  consultaId?: number
) => {
  try {
    const { data, error } = await supabase.rpc('is_doctor_available', {
      p_medico_id: medicoId,
      p_data_hora: dataHora,
      p_consulta_id: consultaId || null
    });
    
    if (error) {
      console.error("Erro ao verificar disponibilidade:", error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error);
    return false;
  }
};

// Buscar horários disponíveis por dia da semana
export const getHorariosByDiaSemana = async (medicoId: number, diaSemana: string) => {
  try {
    const { data, error } = await supabase
      .from('horarios_disponiveis')
      .select('*')
      .eq('id_medico', medicoId)
      .ilike('dia_semana', diaSemana)
      .order('hora_inicio');
    
    if (error) {
      console.error("Erro ao buscar horários por dia:", error);
      return { data: [], error };
    }
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Erro ao buscar horários por dia:", error);
    return { data: [], error: { message: "Erro interno do servidor" } };
  }
};