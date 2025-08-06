import { supabase } from '@/integrations/supabase/client';

export const getPacientes = async (doctorId?: string) => {
  try {
    if (doctorId) {
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
        .eq('doctor_id', doctorId)
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
    const { data: result, error } = await supabase
      .from('patients')
      .insert([data])
      .select();
    
    if (error) {
      console.error('Error creating patient:', error);
      return { success: false, error };
    }
    
    console.log('[createPaciente] Resultado:', result);
    return { success: true, error: null, data: result?.[0] };
  } catch (error) {
    console.error('Error in createPaciente:', error);
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
      .or(`profiles.full_name.ilike.%${query}%,profiles.email.ilike.%${query}%,cpf.ilike.%${query}%`)
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
      .or(`profiles.full_name.ilike.%${query}%,profiles.email.ilike.%${query}%,cpf.ilike.%${query}%`)
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