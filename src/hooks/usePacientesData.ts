
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

interface Paciente {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  data_nascimento: string;
  condicao_medica?: string;
  endereco?: string;
  genero?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

interface Consulta {
  id: number;
  data_hora: string;
  motivo: string;
  status: string;
  tipo_consulta: string;
  pacientes_app: {
    id: number;
    nome: string;
  } | null;
}

export function usePacientesData() {
  const { toast } = useToast();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPacientes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .order('nome');

      if (error) throw error;
      setPacientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast({
        title: "Erro ao carregar pacientes",
        description: "Não foi possível carregar a lista de pacientes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConsultas = async () => {
    try {
      // Usar LEFT JOIN para evitar erro de relação
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          id,
          data_hora,
          motivo,
          status,
          tipo_consulta,
          id_paciente
        `)
        .order('data_hora', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Buscar dados dos pacientes separadamente se necessário
      const consultasWithPatients = (data || []).map(consulta => ({
        ...consulta,
        pacientes_app: null // Por enquanto, pode ser expandido depois
      }));

      setConsultas(consultasWithPatients);
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
    }
  };

  useEffect(() => {
    fetchPacientes();
    fetchConsultas();
  }, []);

  return {
    pacientes,
    consultas,
    selectedPaciente,
    isLoading,
    setSelectedPaciente,
    setConsultas,
    refetch: () => {
      fetchPacientes();
      fetchConsultas();
    }
  };
}
