
import { supabase } from "@/integrations/supabase/client";

export const createPedidoExame = async (pedidoExameData: any) => {
  try {
    const { data, error } = await supabase
      .from('pedidos_exame')
      .insert([pedidoExameData])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar pedido de exame:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao criar pedido de exame:", error);
    return null;
  }
};
