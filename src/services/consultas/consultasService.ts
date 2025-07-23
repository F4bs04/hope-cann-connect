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
    // Validar dados obrigatórios
    if (!consultaData.id_medico || !consultaData.id_paciente || !consultaData.data_hora) {
      return { 
        data: null, 
        error: { 
          message: "Dados obrigatórios faltando (id_medico, id_paciente, data_hora)", 
          code: 'VALIDATION_ERROR' 
        } 
      };
    }

    // Verificar se o médico está disponível no horário solicitado
    const { data: isAvailable, error: availabilityError } = await supabase.rpc('is_doctor_available', {
      p_medico_id: consultaData.id_medico,
      p_data_hora: consultaData.data_hora
    });

    if (availabilityError) {
      console.error("[createConsulta] Erro ao verificar disponibilidade:", availabilityError);
      return { data: null, error: { message: "Erro ao verificar disponibilidade do médico", code: 'AVAILABILITY_CHECK_ERROR' } };
    }

    if (!isAvailable) {
      return { 
        data: null, 
        error: { 
          message: "Médico não está disponível neste horário", 
          code: 'DOCTOR_NOT_AVAILABLE' 
        } 
      };
    }

    // Criar a consulta
    const { data, error } = await supabase
      .from('consultas')
      .insert([{
        ...consultaData,
        status: consultaData.status || 'agendada',
        data_criacao: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error("[createConsulta] Erro detalhado ao criar consulta no Supabase:", JSON.stringify(error, null, 2));
      
      // Tratar erros específicos
      if (error.code === '23505') {
        return { data: null, error: { message: "Já existe uma consulta neste horário", code: 'DUPLICATE_APPOINTMENT' } };
      }
      
      if (error.code === '23503') {
        return { data: null, error: { message: "Médico ou paciente não encontrado", code: 'FOREIGN_KEY_ERROR' } };
      }
      
      return { data: null, error: { message: error.message || "Erro ao criar consulta", code: error.code || 'DATABASE_ERROR' } }; 
    }
    
    console.log("[createConsulta] Consulta criada com sucesso no Supabase:", JSON.stringify(data, null, 2));
    return { data, error: null };
  } catch (error: any) {
    console.error("[createConsulta] Exceção ao tentar criar consulta:", JSON.stringify(error, null, 2));
    return { 
      data: null, 
      error: { 
        message: error.message || "Erro interno do servidor", 
        details: error.toString(), 
        code: 'EXCEPTION' 
      } 
    };
  }
};
