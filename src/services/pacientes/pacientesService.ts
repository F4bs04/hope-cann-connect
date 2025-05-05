
import { supabase } from "@/integrations/supabase/client";

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

export const createPaciente = async (pacienteData: any) => {
  try {
    const { data, error } = await supabase
      .from('pacientes_app')
      .insert([pacienteData])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar paciente:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao criar paciente:", error);
    return null;
  }
};

export const getSaldoPacientes = async () => {
  try {
    const { data, error } = await supabase
      .from('saldo_pacientes')
      .select('*, pacientes_app(nome)')
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
