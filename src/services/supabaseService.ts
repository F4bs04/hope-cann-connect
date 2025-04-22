import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Patients
export const getPacientes = async () => {
  try {
    const { data, error } = await supabase
      .from('pacientes_app')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    toast({
      variant: "destructive",
      title: "Erro ao carregar pacientes",
      description: error.message,
    });
    return [];
  }
};

export const getPacienteById = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('pacientes_app')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error(`Error fetching patient with id ${id}:`, error);
    return null;
  }
};

export const createPaciente = async (paciente: any) => {
  try {
    const { data, error } = await supabase
      .from('pacientes_app')
      .insert(paciente)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Paciente adicionado",
      description: "O paciente foi cadastrado com sucesso",
    });
    
    return data;
  } catch (error: any) {
    console.error('Error creating patient:', error);
    toast({
      variant: "destructive",
      title: "Erro ao adicionar paciente",
      description: error.message,
    });
    return null;
  }
};

export const updatePaciente = async (id: number, paciente: any) => {
  try {
    const { data, error } = await supabase
      .from('pacientes_app')
      .update(paciente)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Paciente atualizado",
      description: "Os dados do paciente foram atualizados com sucesso",
    });
    
    return data;
  } catch (error: any) {
    console.error('Error updating patient:', error);
    toast({
      variant: "destructive",
      title: "Erro ao atualizar paciente",
      description: error.message,
    });
    return null;
  }
};

// Prontuarios
export const getProntuarios = async () => {
  try {
    const { data, error } = await supabase
      .from('prontuarios')
      .select(`
        *,
        pacientes_app:id_paciente (id, nome, idade)
      `)
      .order('data_consulta', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching medical records:', error);
    return [];
  }
};

export const getProntuariosByPacienteId = async (pacienteId: number) => {
  try {
    const { data, error } = await supabase
      .from('prontuarios')
      .select('*')
      .eq('id_paciente', pacienteId)
      .order('data_consulta', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error(`Error fetching medical records for patient ${pacienteId}:`, error);
    return [];
  }
};

export const createProntuario = async (prontuario: any) => {
  try {
    const { data, error } = await supabase
      .from('prontuarios')
      .insert(prontuario)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Prontuário criado",
      description: "O prontuário foi criado com sucesso",
    });
    
    return data;
  } catch (error: any) {
    console.error('Error creating medical record:', error);
    toast({
      variant: "destructive",
      title: "Erro ao criar prontuário",
      description: error.message,
    });
    return null;
  }
};

// Receitas
export const getReceitas = async () => {
  try {
    const { data, error } = await supabase
      .from('receitas_app')
      .select(`
        *,
        pacientes_app:id_paciente (id, nome)
      `)
      .order('data', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching prescriptions:', error);
    return [];
  }
};

export const createReceita = async (receita: any) => {
  try {
    const { data, error } = await supabase
      .from('receitas_app')
      .insert(receita)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Receita emitida",
      description: "A receita foi emitida com sucesso",
    });
    
    return data;
  } catch (error: any) {
    console.error('Error creating prescription:', error);
    toast({
      variant: "destructive",
      title: "Erro ao emitir receita",
      description: error.message,
    });
    return null;
  }
};

// Atestados
export const createAtestado = async (atestado: any) => {
  try {
    const { data, error } = await supabase
      .from('atestados')
      .insert(atestado)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Atestado emitido",
      description: "O atestado foi emitido com sucesso",
    });
    
    return data;
  } catch (error: any) {
    console.error('Error creating certificate:', error);
    toast({
      variant: "destructive",
      title: "Erro ao emitir atestado",
      description: error.message,
    });
    return null;
  }
};

// Laudos
export const createLaudo = async (laudo: any) => {
  try {
    const { data, error } = await supabase
      .from('laudos')
      .insert(laudo)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Laudo emitido",
      description: "O laudo foi emitido com sucesso",
    });
    
    return data;
  } catch (error: any) {
    console.error('Error creating report:', error);
    toast({
      variant: "destructive",
      title: "Erro ao emitir laudo",
      description: error.message,
    });
    return null;
  }
};

// Pedidos de Exame
export const createPedidoExame = async (pedido: any) => {
  try {
    const { data, error } = await supabase
      .from('pedidos_exame')
      .insert(pedido)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Pedido de exame emitido",
      description: "O pedido de exame foi emitido com sucesso",
    });
    
    return data;
  } catch (error: any) {
    console.error('Error creating exam request:', error);
    toast({
      variant: "destructive",
      title: "Erro ao emitir pedido de exame",
      description: error.message,
    });
    return null;
  }
};

// Saldo e Transações
export const getSaldoMedico = async (medicoId: number) => {
  try {
    const { data, error } = await supabase
      .from('saldo_medicos')
      .select('*')
      .eq('id_medico', medicoId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching doctor balance:', error);
    return null;
  }
};

export const getTransacoesMedico = async (medicoId: number, limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('transacoes_medicos')
      .select('*')
      .eq('id_medico', medicoId)
      .order('data_transacao', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching doctor transactions:', error);
    return [];
  }
};
