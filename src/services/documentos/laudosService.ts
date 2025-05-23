
import { supabase } from "@/integrations/supabase/client";

export const getLaudosByPaciente = async (pacienteId: number) => {
  try {
    const { data, error } = await supabase
      .from('laudos')
      .select('*')
      .eq('id_paciente', pacienteId)
      .order('data_emissao', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar laudos:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar laudos:", error);
    return [];
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
