
import { supabase } from "@/integrations/supabase/client";

export const getPacientes = async () => {
  try {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .order('created_at', { ascending: false });
    
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

export const createPaciente = async (pacienteData: any) => {
  try {
    const { data, error } = await supabase
      .from('pacientes')
      .insert([pacienteData])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar paciente:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Erro ao criar paciente:", error);
    return { data: null, error: { message: error.message } };
  }
};

export const updatePaciente = async (id: number, pacienteData: any) => {
  try {
    const { data, error } = await supabase
      .from('pacientes')
      .update(pacienteData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao atualizar paciente:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Erro ao atualizar paciente:", error);
    return { data: null, error: { message: error.message } };
  }
};

export const getPacienteById = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Erro ao buscar paciente:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar paciente:", error);
    return null;
  }
};

export const getSaldoPacientes = async () => {
  try {
    const { data, error } = await supabase
      .from('saldo_pacientes')
      .select(`
        *,
        pacientes_backup!inner(nome)
      `)
      .order('saldo_total', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar saldo dos pacientes:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar saldo dos pacientes:", error);
    return [];
  }
};
