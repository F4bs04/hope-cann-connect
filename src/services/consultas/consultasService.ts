
import { supabase } from "@/integrations/supabase/client";

export const getConsultas = async () => {
  try {
    const { data, error } = await supabase
      .from('consultas')
      .select('*');
    
    if (error) {
      console.error("Erro ao buscar consultas:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar consultas:", error);
    return [];
  }
};

export const createConsulta = async (consultaData: any) => {
  try {
    const { data, error } = await supabase
      .from('consultas')
      .insert([consultaData])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar consulta:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao criar consulta:", error);
    return null;
  }
};
