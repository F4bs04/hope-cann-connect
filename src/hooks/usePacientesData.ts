
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

interface Paciente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  idade: number;
  condicao?: string;
  data_nascimento?: string;
  endereco?: string;
  genero?: string;
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
  };
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
        .from('pacientes_app')
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
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          id,
          data_hora,
          motivo,
          status,
          tipo_consulta,
          pacientes_app (id, nome)
        `)
        .order('data_hora', { ascending: false })
        .limit(10);

      if (error) throw error;
      setConsultas(data || []);
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
