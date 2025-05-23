
import { supabase } from "@/integrations/supabase/client";

export const getPacientes = async () => {
  try {
    const { data, error } = await supabase
      .from('pacientes_app')
      .select('*');
    
    if (error) {
      console.error("Erro ao buscar pacientes:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return [];
  }
};

export const createPaciente = async (pacienteData: any) => {
  try {
    const { data, error } = await supabase
      .from('pacientes_app')
      .insert([pacienteData])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar paciente:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao criar paciente:", error);
    return null;
  }
};

export const getPacienteById = async (id: number) => {
  try {
    // Buscar informações básicas do paciente
    const { data: paciente, error: pacienteError } = await supabase
      .from('pacientes_app')
      .select('*')
      .eq('id', id)
      .single();
    
    if (pacienteError) {
      console.error("Erro ao buscar paciente por ID:", pacienteError);
      return null;
    }

    // Buscar consultas relacionadas a este paciente
    const { data: consultas, error: consultasError } = await supabase
      .from('consultas')
      .select(`
        id,
        data_hora,
        motivo,
        status,
        tipo_consulta
      `)
      .eq('id_paciente', id)
      .order('data_hora', { ascending: false });
    
    if (consultasError) {
      console.error("Erro ao buscar consultas do paciente:", consultasError);
    }

    // Buscar prontuários relacionados ao paciente (opcional)
    const { data: prontuarios, error: prontuariosError } = await supabase
      .from('prontuarios')
      .select('id, data, conteudo')
      .eq('id_paciente', id)
      .order('data', { ascending: false });
    
    if (prontuariosError) {
      console.error("Erro ao buscar prontuários do paciente:", prontuariosError);
    }

    // Retornar paciente com dados relacionados
    return {
      ...paciente,
      consultas: consultas || [],
      prontuarios: prontuarios || []
    };
  } catch (error) {
    console.error("Erro ao buscar paciente por ID:", error);
    return null;
  }
};

export const getSaldoPacientes = async () => {
  try {
    const { data, error } = await supabase
      .from('saldo_pacientes')
      .select('*, pacientes_app(nome)')
      .order('saldo_total', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar saldo dos pacientes:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar saldo dos pacientes:", error);
    return [];
  }
};
