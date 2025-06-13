
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';

interface DashboardData {
  proximaConsulta: {
    data: string;
    horario: string;
  } | null;
  consultasPendentes: number;
  novosDocumentos: number;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    proximaConsulta: null,
    consultasPendentes: 0,
    novosDocumentos: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { userInfo, loading: userLoading } = useCurrentUserInfo();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (userLoading || !userInfo.pacienteId) return;

        setIsLoading(true);

        // Buscar próxima consulta
        const { data: proximaConsultaData } = await supabase
          .from('consultas')
          .select('data_hora')
          .eq('id_paciente', userInfo.pacienteId)
          .eq('status', 'agendada')
          .gte('data_hora', new Date().toISOString())
          .order('data_hora', { ascending: true })
          .limit(1)
          .maybeSingle();

        // Buscar consultas pendentes
        const { count: consultasPendentesCount } = await supabase
          .from('consultas')
          .select('id', { count: 'exact' })
          .eq('id_paciente', userInfo.pacienteId)
          .eq('status', 'agendada')
          .gte('data_hora', new Date().toISOString());

        // Buscar novos documentos (receitas dos últimos 30 dias)
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 30);
        
        const { count: novosDocumentosCount } = await supabase
          .from('receitas_app')
          .select('id', { count: 'exact' })
          .eq('id_paciente', userInfo.pacienteId)
          .gte('data', dataLimite.toISOString());

        // Processar próxima consulta
        let proximaConsulta = null;
        if (proximaConsultaData?.data_hora) {
          const dataConsulta = new Date(proximaConsultaData.data_hora);
          proximaConsulta = {
            data: dataConsulta.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit'
            }),
            horario: dataConsulta.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })
          };
        }

        setData({
          proximaConsulta,
          consultasPendentes: consultasPendentesCount || 0,
          novosDocumentos: novosDocumentosCount || 0
        });

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do dashboard.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [toast, userInfo, userLoading]);

  return { data, isLoading };
}
