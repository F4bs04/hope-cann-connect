import { useState, useEffect } from 'react';
import { getPacientes, createPaciente, updatePaciente, addPatientToDoctor } from '@/services/pacientes/pacientesService';
import { useAuth } from '@/hooks/useAuth';

export const usePacientesData = () => {
  const [pacientes, setPacientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { medicoId } = useAuth();
  const medicoIdString = medicoId ? String(medicoId) : undefined;

  const fetchPacientes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPacientes(medicoIdString);
      setPacientes(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (medicoIdString) {
      fetchPacientes();
    }
  }, [medicoIdString]);

  const addPaciente = async (pacienteData) => {
    try {
      const result = await createPaciente(pacienteData);
      if (result.success && medicoIdString && result.data) {
        // Add relationship between doctor and patient
        await addPatientToDoctor(medicoIdString, result.data.id);
        await fetchPacientes();
      }
      return result;
    } catch (err) {
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
      if (medicoIdString) {
        const result = await addPatientToDoctor(medicoIdString, patientId, notes);
        if (result.success) {
          await fetchPacientes();
        }
        return result;
      }
      return { success: false, error: 'Doctor ID not found' };
    }
  };
};