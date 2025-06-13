
import React, { useState, useEffect } from 'react';
import { DoctorScheduleProvider } from '@/contexts/DoctorScheduleContext';
import AgendaTab from '@/components/medico/AgendaTab';
import FastAgendamento from '@/components/medico/FastAgendamento';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import AppointmentsList from '@/components/medico/AppointmentsList';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import AgendamentoForm from '@/components/medico/AgendamentoForm';
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';

const AgendaMedica: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userInfo, loading: userLoading } = useCurrentUserInfo();

  const fetchAppointments = async () => {
    if (userLoading || !userInfo.medicoId) {
      console.log('Aguardando dados do médico...');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Buscando consultas para médico ID:', userInfo.medicoId);
      
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('consultas')
        .select(`
          id,
          data_hora,
          motivo,
          status,
          tipo_consulta,
          repeticao,
          dias_semana,
          dia_mes,
          pacientes_app:id_paciente (id, nome)
        `)
        .eq('id_medico', userInfo.medicoId)
        .order('data_hora', { ascending: true });
      
      if (appointmentsError) {
        console.error('Erro ao buscar agendamentos:', appointmentsError);
        throw appointmentsError;
      }
      
      console.log('Consultas encontradas:', appointmentsData);
      setAppointments(appointmentsData || []);
    } catch (error: any) {
      console.error("Erro ao buscar agendamentos:", error);
      setError(`Erro ao carregar agendamentos: ${error.message}`);
      toast({
        variant: "destructive",
        title: "Erro ao carregar agenda",
        description: error.message || "Não foi possível carregar os agendamentos."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading && userInfo.medicoId) {
      fetchAppointments();
    }
  }, [userInfo.medicoId, userLoading]);

  useEffect(() => {
    if (!userInfo.medicoId) return;

    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'consultas',
        filter: `id_medico=eq.${userInfo.medicoId}`
      }, () => {
        console.log('Mudança detectada na tabela consultas');
        fetchAppointments();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(appointmentsChannel);
    };
  }, [userInfo.medicoId]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-hopecann-teal" />
          <p>Carregando informações do médico...</p>
        </div>
      </div>
    );
  }

  if (!userInfo.medicoId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro de Acesso</AlertTitle>
        <AlertDescription>
          Não foi possível identificar o médico. Faça login novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Agenda Médica</h1>
      
      <DoctorScheduleProvider>
        <Tabs defaultValue="consultas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="consultas">Consultas</TabsTrigger>
            <TabsTrigger value="agendamento">Agendar Consulta</TabsTrigger>
            <TabsTrigger value="configurar">Configurar Horários</TabsTrigger>
            <TabsTrigger value="agendamento-rapido">Agendamento Rápido</TabsTrigger>
          </TabsList>

          <TabsContent value="consultas">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-hopecann-teal" />
                Minhas Consultas
              </h2>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {loading ? (
                <div className="py-8 text-center text-gray-500">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
                  Carregando agendamentos...
                </div>
              ) : appointments.length > 0 ? (
                <AppointmentsList appointments={appointments} />
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhuma consulta agendada</h3>
                      <p className="text-gray-500 max-w-sm mb-4">
                        Você não possui consultas agendadas. Configure sua disponibilidade para começar a receber agendamentos.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="agendamento">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-hopecann-teal" />
                Agendar Consulta
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <AgendamentoForm onSuccess={fetchAppointments} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="configurar">
            <AgendaTab />
          </TabsContent>

          <TabsContent value="agendamento-rapido">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-hopecann-teal" />
                Agendamento Rápido
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <FastAgendamento 
                    consultationDuration="30"
                    fullWidth={true}
                    onAgendamentoRapido={async (data) => {
                      try {
                        await fetchAppointments();
                      } catch (error) {
                        console.error('Error refreshing appointments:', error);
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DoctorScheduleProvider>
    </div>
  );
};

export default AgendaMedica;
