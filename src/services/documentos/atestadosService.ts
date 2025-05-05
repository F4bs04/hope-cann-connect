
import { supabase } from "@/integrations/supabase/client";

export const getAtestadosByPaciente = async (pacienteId: number) => {
  try {
    const { data, error } = await supabase
      .from('atestados')
      .select('*')
      .eq('id_paciente', pacienteId)
      .order('data_emissao', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar atestados:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar atestados:", error);
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
