
import { supabase } from "@/integrations/supabase/client";

export const getReceitas = async () => {
  try {
    const { data, error } = await supabase
      .from('receitas_app')
      .select('*, pacientes_app(nome)')
      .order('data', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar receitas:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar receitas:", error);
    return [];
  }
};

export const createReceita = async (receitaData: any) => {
  try {
    const { data, error } = await supabase
      .from('receitas_app')
      .insert([receitaData])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar receita:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao criar receita:", error);
    return null;
  }
};
