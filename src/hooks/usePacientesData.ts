import { useState, useEffect } from 'react';
import { getPacientes, createPaciente, updatePaciente, addPatientToDoctor } from '@/services/pacientes/pacientesService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const usePacientesData = () => {
  const [pacientes, setPacientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const userUuid = user?.id;

  const fetchPacientes = async () => {
    if (!userUuid) {
      console.log('[usePacientesData] UUID do usuário não disponível');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      console.log('[usePacientesData] Buscando pacientes para UUID:', userUuid);
      const data = await getPacientes(userUuid);
      console.log('[usePacientesData] Pacientes retornados:', data);
      setPacientes(data);
    } catch (err) {
      console.error('[usePacientesData] Erro ao buscar pacientes:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userUuid) {
      fetchPacientes();
    }
  }, [userUuid]);

  const addPaciente = async (pacienteData) => {
    try {
      console.log('[usePacientesData] addPaciente chamado com:', pacienteData);
      const result = await createPaciente(pacienteData);
      console.log('[usePacientesData] createPaciente retornou:', result);
      
      if (result.success && userUuid && result.data) {
        // Buscar o UUID do médico
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', userUuid)
          .single();

        if (doctorError || !doctorData) {
          console.error('[usePacientesData] Médico não encontrado');
          return { success: false, error: 'Médico não encontrado' };
        }

        console.log('[usePacientesData] Adicionando relacionamento médico-paciente...');
        // Add relationship between doctor and patient
        const relationResult = await addPatientToDoctor(doctorData.id, result.data.id);
        console.log('[usePacientesData] Resultado do relacionamento:', relationResult);
        
        await fetchPacientes();
      }
      return result;
    } catch (err) {
      console.error('[usePacientesData] Erro em addPaciente:', err);
      return { success: false, error: err };
    }
  };

  const updatePacienteData = async (id, data) => {
    try {
      const result = await updatePaciente(id, data);
      if (result.success) {
        await fetchPacientes();
      }
      return result;
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const filteredPacientes = pacientes.filter(paciente => {
    if (!searchTerm) return true;
    const fullName = paciente.profiles?.full_name || '';
    const email = paciente.profiles?.email || '';
    const cpf = paciente.cpf || '';
    return (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cpf.includes(searchTerm)
    );
  });

  return {
    pacientes: filteredPacientes,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    addPaciente,
    updatePaciente: updatePacienteData,
    refetch: fetchPacientes,
    addPatientToDoctor: async (patientId: string, notes?: string) => {
      if (userUuid) {
        try {
          // Buscar o UUID do médico
          const { data: doctorData, error: doctorError } = await supabase
            .from('doctors')
            .select('id')
            .eq('user_id', userUuid)
            .single();

          if (doctorError || !doctorData) {
            return { success: false, error: 'Médico não encontrado' };
          }

          const result = await addPatientToDoctor(doctorData.id, patientId, notes);
          if (result.success) {
            await fetchPacientes();
          }
          return result;
        } catch (error) {
          return { success: false, error };
        }
      }
      return { success: false, error: 'User ID not found' };
    }
  };
};