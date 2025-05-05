
import { supabase } from "@/integrations/supabase/client";

export const getPedidosExameByPaciente = async (pacienteId: number) => {
  try {
    const { data, error } = await supabase
      .from('pedidos_exame')
      .select('*')
      .eq('id_paciente', pacienteId)
      .order('data_solicitacao', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar pedidos de exame:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar pedidos de exame:", error);
    return [];
  }
};

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
