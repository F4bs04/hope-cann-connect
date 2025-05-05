
import { supabase } from "@/integrations/supabase/client";

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
