import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Pacientes
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

// Funções para buscar saldo e transações de todos os médicos
export const getSaldoMedicos = async () => {
  try {
    const { data, error } = await supabase
      .from('saldo_medicos')
      .select('*, medicos(nome, especialidade, crm, foto_perfil)')
      .order('saldo_total', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching doctors balance:', error);
    return [];
  }
};

export const getTransacoesMedicos = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('transacoes_medicos')
      .select('*, medicos(nome)')
      .order('data_transacao', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching doctor transactions:', error);
    return [];
  }
};

// Pacientes - buscar saldo do paciente (NOVA FUNÇÃO)
export const getSaldoPacienteById = async (pacienteId: number) => {
  try {
    const { data, error } = await supabase
      .from("saldo_pacientes")
      .select("*")
      .eq("id_paciente", pacienteId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error(`Erro ao buscar saldo do paciente ${pacienteId}:`, error);
    return { saldo_total: 0 };
  }
};

// Chat Médico-Paciente
export const getChatsAtivos = async (medicoId: number) => {
  try {
    const { data, error } = await supabase
      .from('chat_ativo')
      .select(`
        *,
        consultas!inner(id, motivo),
        pacientes_app!inner(id, nome)
      `)
      .eq('id_medico', medicoId)
      .eq('ativo', true)
      .order('data_inicio', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching active chats:', error);
    return [];
  }
};

export const getChatsAtivosPaciente = async (pacienteId: number) => {
  try {
    const { data, error } = await supabase
      .from('chat_ativo')
      .select(`
        *,
        consultas!inner(id, motivo),
        medicos!inner(id, nome, especialidade, foto_perfil)
      `)
      .eq('id_paciente', pacienteId)
      .eq('ativo', true)
      .order('data_inicio', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching patient active chats:', error);
    return [];
  }
};

export const getMensagensChat = async (medicoId: number, pacienteId: number) => {
  try {
    const { data, error } = await supabase
      .from('mensagens_chat')
      .select('*')
      .eq('id_medico', medicoId)
      .eq('id_paciente', pacienteId)
      .order('data_envio', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
};

export const enviarMensagem = async (mensagem: {
  id_medico: number;
  id_paciente: number;
  remetente_tipo: 'medico' | 'paciente';
  mensagem: string;
  id_consulta?: number;
}) => {
  try {
    const { data, error } = await supabase
      .from('mensagens_chat')
      .insert(mensagem)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error sending message:', error);
    toast({
      variant: "destructive",
      title: "Erro ao enviar mensagem",
      description: error.message,
    });
    return null;
  }
};

export const marcarMensagensComoLidas = async (medicoId: number, pacienteId: number, remetenteTipo: 'medico' | 'paciente') => {
  try {
    const tipoOposto = remetenteTipo === 'medico' ? 'paciente' : 'medico';
    
    const { error } = await supabase
      .from('mensagens_chat')
      .update({ lida: true })
      .eq('id_medico', medicoId)
      .eq('id_paciente', pacienteId)
      .eq('remetente_tipo', tipoOposto)
      .eq('lida', false);
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

export const verificarChatAtivo = async (medicoId: number, pacienteId: number) => {
  try {
    const { data, error } = await supabase
      .from('chat_ativo')
      .select('*')
      .eq('id_medico', medicoId)
      .eq('id_paciente', pacienteId)
      .eq('ativo', true)
      .maybeSingle();
    
    if (error) throw error;
    
    return data !== null;
  } catch (error: any) {
    console.error('Error checking active chat:', error);
    return false;
  }
};

// Função para verificar senha de clínica
export const verifyClinicPassword = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase
      .rpc('verify_clinic_password', {
        p_email: email,
        p_password: password
      });
    
    if (error) throw error;
    return data === true;
  } catch (error: any) {
    console.error('Error verifying clinic password:', error);
    return false;
  }
};

// Funções para upload e download de PDFs
export const getDocumentUrl = async (filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('documentos_medicos')
      .createSignedUrl(filePath, 60 * 60); // URL válida por 1 hora
    
    if (error) throw error;
    return data.signedUrl;
  } catch (error: any) {
    console.error('Error getting document URL:', error);
    return null;
  }
};

export const downloadDocument = async (filePath: string, fileName: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('documentos_medicos')
      .download(filePath);
    
    if (error) throw error;
    
    // Criar URL para download
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error: any) {
    console.error('Error downloading document:', error);
    toast({
      variant: "destructive",
      title: "Erro ao baixar documento",
      description: error.message || "Não foi possível baixar o documento",
    });
    return false;
  }
};
