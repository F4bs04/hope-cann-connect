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
  console.log("[createConsulta] Iniciando criação de consulta com dados:", JSON.stringify(consultaData, null, 2));
  try {
    const { data, error } = await supabase
      .from('consultas')
      .insert([consultaData])
      .select()
      .single();
    
    if (error) {
      console.error("[createConsulta] Erro detalhado ao criar consulta no Supabase:", JSON.stringify(error, null, 2));
      // Retornar o erro para que possa ser tratado no frontend
      return { data: null, error }; 
    }
    
    console.log("[createConsulta] Consulta criada com sucesso no Supabase:", JSON.stringify(data, null, 2));
    return { data, error: null };
  } catch (error: any) {
    console.error("[createConsulta] Exceção ao tentar criar consulta:", JSON.stringify(error, null, 2));
    // Retornar a exceção como um erro
    return { data: null, error: { message: error.message, details: error.toString(), code: 'EXCEPTION' } };
  }
};
