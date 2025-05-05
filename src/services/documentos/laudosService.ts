
import { supabase } from "@/integrations/supabase/client";

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
