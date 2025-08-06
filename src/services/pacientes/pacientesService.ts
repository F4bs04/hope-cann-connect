import { supabase } from '@/integrations/supabase/client';

export const getPacientes = async (doctorIdString?: string) => {
  try {
    console.log('[getPacientes] doctorIdString recebido:', doctorIdString);
    
    if (doctorIdString) {
      // Primeiro, buscar o UUID do médico pela tabela doctors
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      console.log('[getPacientes] Dados do médico:', doctorData);
      console.log('[getPacientes] Erro ao buscar médico:', doctorError);

      if (doctorError || !doctorData) {
        console.error('[getPacientes] Médico não encontrado');
        return [];
      }

      const doctorUuid = doctorData.id;
      console.log('[getPacientes] UUID do médico:', doctorUuid);

      // Get patients for specific doctor via doctor_patients relationship
      const { data, error } = await supabase
        .from('doctor_patients')
        .select(`
          patients!inner (
            *,
            profiles (
              full_name,
              email,
              avatar_url
            )
          )
        `)
        .eq('doctor_id', doctorUuid)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting doctor patients:', error);
        return [];
      }

      // Extract the patients from the relationship
      return data?.map(item => item.patients).filter(patient => patient != null) || [];
    } else {
      // Get all patients (for admins) - direct query without doctor relationship
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          profiles (
            full_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting patients:', error);
        return [];
      }

      return data || [];
    }
  } catch (error) {
    console.error('Error in getPacientes:', error);
    return [];
  }
};

export const getPacienteById = async (id) => {
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createPaciente = async (data) => {
  try {
    console.log('[createPaciente] Dados recebidos:', data);
    
    // Verificar se o usuário é um médico aprovado
    const { data: user } = await supabase.auth.getUser();
    console.log('[createPaciente] Current user:', user.user?.id);
    
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .select('id, is_approved, is_suspended')
      .eq('user_id', user.user?.id)
      .eq('is_approved', true)
      .eq('is_suspended', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    console.log('[createPaciente] Dados do médico:', doctorData);
    console.log('[createPaciente] Erro ao buscar médico:', doctorError);
    
    if (doctorError || !doctorData) {
      console.error('[createPaciente] Médico não encontrado ou não aprovado:', doctorError);
      return { 
        success: false, 
        error: doctorError?.code === 'PGRST116' 
          ? 'Médico não aprovado ou não encontrado' 
          : 'Erro ao verificar dados do médico' 
      };
    }
    
    // Verificação adicional para garantir que o médico está aprovado
    if (!doctorData.is_approved || doctorData.is_suspended) {
      console.error('[createPaciente] Médico não está aprovado ou está suspenso');
      return { 
        success: false, 
        error: 'Médico não aprovado para criar pacientes' 
      };
    }
    
    // Preparar dados do paciente (médicos criam pacientes sem user_id)
    const patientData = {
      ...data,
      user_id: null, // Pacientes criados por médicos não têm user_id
    };
    
    const { data: result, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select();
    
    if (error) {
      console.error('[createPaciente] Error creating patient:', error);
      return { success: false, error };
    }
    
    // Associar paciente ao médico
    if (result && result[0]) {
      await addPatientToDoctor(doctorData.id, result[0].id);
    }
    
    console.log('[createPaciente] Resultado:', result);
    return { success: true, error: null, data: result?.[0] };
  } catch (error) {
    console.error('[createPaciente] Error in createPaciente:', error);
    return { success: false, error };
  }
};

export const addPatientToDoctor = async (doctorId: string, patientId: string, notes?: string) => {
  try {
    const { error } = await supabase
      .from('doctor_patients')
      .insert([{ doctor_id: doctorId, patient_id: patientId, notes }]);
    
    return { success: !error, error };
  } catch (error) {
    console.error('Error adding patient to doctor:', error);
    return { success: false, error };
  }
};

export const searchAllPatients = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        profiles (
          full_name,
          email,
          avatar_url
        )
      `)
      .or(`full_name.ilike.%${query}%,profiles.full_name.ilike.%${query}%,profiles.email.ilike.%${query}%,cpf.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching all patients:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchAllPatients:', error);
    return [];
  }
};

export const updatePaciente = async (id, data) => {
  const { error } = await supabase.from('patients').update(data).eq('id', id);
  return { success: !error, error };
};

export const deletePaciente = async (id) => {
  const { error } = await supabase.from('patients').delete().eq('id', id);
  return { success: !error, error };
};

export const searchPacientes = async (query) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        profiles (
          full_name,
          email,
          avatar_url
        )
      `)
      .or(`full_name.ilike.%${query}%,profiles.full_name.ilike.%${query}%,profiles.email.ilike.%${query}%,cpf.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching patients:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchPacientes:', error);
    return [];
  }
};

export const getSaldoPacientes = async () => {
  // TODO: Implementar quando sistema financeiro for desenvolvido
  return [];
};