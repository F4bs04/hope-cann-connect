
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';

interface DashboardMetrics {
  consultasHoje: number;
  consultasSemana: number;
  consultasMes: number;
  receitaGerada: number;
  pacientesAtivos: number;
  proximaConsulta: {
    id: number;
    paciente: string;
    data: string;
    horario: string;
  } | null;
  consultasRecentes: Array<{
    id: number;
    paciente: string;
    data: string;
    tipo: string;
    status: string;
  }>;
  alertas: Array<{
    tipo: 'info' | 'warning' | 'error';
    mensagem: string;
  }>;
}

export function useMedicoDashboardData() {
  const [data, setData] = useState<DashboardMetrics>({
    consultasHoje: 0,
    consultasSemana: 0,
    consultasMes: 0,
    receitaGerada: 0,
    pacientesAtivos: 0,
    proximaConsulta: null,
    consultasRecentes: [],
    alertas: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { userInfo, loading: userLoading } = useCurrentUserInfo();

  const fetchDashboardData = async () => {
    try {
      if (userLoading || !userInfo.medicoId) return;

      setIsLoading(true);

      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      // Consultas de hoje
      const { count: consultasHoje } = await supabase
        .from('consultas')
        .select('id', { count: 'exact' })
        .eq('id_medico', userInfo.medicoId)
        .gte('data_hora', hoje.toISOString().split('T')[0])
        .lt('data_hora', new Date(hoje.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      // Consultas da semana
      const { count: consultasSemana } = await supabase
        .from('consultas')
        .select('id', { count: 'exact' })
        .eq('id_medico', userInfo.medicoId)
        .gte('data_hora', inicioSemana.toISOString());

      // Consultas do mês
      const { count: consultasMes } = await supabase
        .from('consultas')
        .select('id', { count: 'exact' })
        .eq('id_medico', userInfo.medicoId)
        .gte('data_hora', inicioMes.toISOString());

      // Próxima consulta
      const { data: proximaConsultaData } = await supabase
        .from('consultas')
        .select(`
          id,
          data_hora,
          tipo_consulta,
          id_paciente
        `)
        .eq('id_medico', userInfo.medicoId)
        .eq('status', 'agendada')
        .gte('data_hora', new Date().toISOString())
        .order('data_hora', { ascending: true })
        .limit(1)
        .maybeSingle();

      // Consultas recentes (últimas 5)
      const { data: consultasRecentesData } = await supabase
        .from('consultas')
        .select(`
          id,
          data_hora,
          tipo_consulta,
          status,
          id_paciente
        `)
        .eq('id_medico', userInfo.medicoId)
        .order('data_hora', { ascending: false })
        .limit(5);

      // Receita gerada (saldo atual do médico)
      const { data: saldoData } = await supabase
        .from('saldo_medicos')
        .select('saldo_total')
        .eq('id_medico', userInfo.medicoId)
        .maybeSingle();

      // Pacientes únicos atendidos no mês
      const { data: pacientesData } = await supabase
        .from('consultas')
        .select('id_paciente')
        .eq('id_medico', userInfo.medicoId)
        .gte('data_hora', inicioMes.toISOString())
        .eq('status', 'realizada');

      const pacientesUnicos = new Set(pacientesData?.map(p => p.id_paciente) || []);

      // Buscar nomes dos pacientes
      const pacienteIds = [
        ...(proximaConsultaData ? [proximaConsultaData.id_paciente] : []),
        ...(consultasRecentesData || []).map(c => c.id_paciente)
      ].filter(Boolean);

      const { data: pacientesNomes } = await supabase
        .from('pacientes')
        .select('id, nome')
        .in('id', pacienteIds);

      const pacientesMap = new Map(
        (pacientesNomes || []).map(p => [p.id, p.nome])
      );

      // Processar próxima consulta
      let proximaConsulta = null;
      if (proximaConsultaData) {
        const dataConsulta = new Date(proximaConsultaData.data_hora);
        proximaConsulta = {
          id: proximaConsultaData.id,
          paciente: pacientesMap.get(proximaConsultaData.id_paciente) || 'Paciente não identificado',
          data: dataConsulta.toLocaleDateString('pt-BR'),
          horario: dataConsulta.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
      }

      // Processar consultas recentes
      const consultasRecentes = (consultasRecentesData || []).map(consulta => {
        const dataConsulta = new Date(consulta.data_hora);
        return {
          id: consulta.id,
          paciente: pacientesMap.get(consulta.id_paciente) || 'Paciente não identificado',
          data: dataConsulta.toLocaleDateString('pt-BR'),
          tipo: consulta.tipo_consulta || 'Consulta padrão',
          status: consulta.status
        };
      });

      // Gerar alertas
      const alertas = [];
      if (consultasHoje === 0) {
        alertas.push({
          tipo: 'info' as const,
          mensagem: 'Nenhuma consulta agendada para hoje'
        });
      }
      if (!proximaConsulta) {
        alertas.push({
          tipo: 'warning' as const,
          mensagem: 'Você não possui consultas agendadas'
        });
      }

      setData({
        consultasHoje: consultasHoje || 0,
        consultasSemana: consultasSemana || 0,
        consultasMes: consultasMes || 0,
        receitaGerada: saldoData?.saldo_total || 0,
        pacientesAtivos: pacientesUnicos.size,
        proximaConsulta,
        consultasRecentes,
        alertas
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard médico:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [toast, userInfo, userLoading]);

  return { data, isLoading, refetch: fetchDashboardData };
}
