
import { supabase } from "@/integrations/supabase/client";

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
