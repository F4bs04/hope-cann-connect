
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
  console.log("[createConsulta] Dados recebidos para criar consulta:", consultaData);
  try {
    const { data, error } = await supabase
      .from('consultas')
      .insert([consultaData])
      .select()
      .single();
    
    if (error) {
      console.error("[createConsulta] Erro ao criar consulta no Supabase:", error);
      // Retornar o erro para que possa ser tratado no frontend, se necessário
      // ou para que a lógica de toast possa exibir uma mensagem mais específica.
      // Poderia ser return { data: null, error }; em vez de apenas null para dar mais contexto.
      return null; 
    }
    
    console.log("[createConsulta] Consulta criada com sucesso:", data);
    return data;
  } catch (error) {
    console.error("[createConsulta] Exceção ao criar consulta:", error);
    return null;
  }
};

