import React, { useState, useEffect } from 'react';
import { DoctorScheduleProvider } from '@/contexts/DoctorScheduleContext';
import AgendaTab from '@/components/medico/AgendaTab';
import FastAgendamento from '@/components/medico/FastAgendamento';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import AppointmentsList from '@/components/medico/AppointmentsList';

const AgendaMedica: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Você precisa estar logado para visualizar sua agenda");
        setLoading(false);
        return;
      }
      const {
        data: userData,
        error: userError
      } = await supabase.from('usuarios').select('id').eq('email', session.user.email).single();
      if (userError) {
        throw userError;
      }
      const {
        data: doctorData,
        error: doctorError
      } = await supabase.from('medicos').select('id').eq('id_usuario', userData.id).single();
      if (doctorError) {
        throw doctorError;
      }

      const {
        data: appointmentsData,
        error: appointmentsError
      } = await supabase.from('consultas').select(`
          id,
          data_hora,
          motivo,
          status,
          tipo_consulta,
          pacientes_app:id_paciente (id, nome)
        `).eq('id_medico', doctorData.id).order('data_hora', {
        ascending: true
      });
      if (appointmentsError) {
        throw appointmentsError;
      }
      setAppointments(appointmentsData || []);
    } catch (error: any) {
      console.error("Erro ao buscar agendamentos:", error);
      setError("Ocorreu um erro ao buscar seus agendamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    const appointmentsChannel = supabase.channel('appointments-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'consultas'
    }, payload => {
      fetchAppointments();
    }).subscribe();
    return () => {
      supabase.removeChannel(appointmentsChannel);
    };
  }, []);

  return <div className="space-y-6">
      <h1 className="text-2xl font-bold">Agenda Médica</h1>
      <DoctorScheduleProvider>
        <Tabs defaultValue="consultas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="consultas">Consultas</TabsTrigger>
            <TabsTrigger value="configurar">Configurar Horários</TabsTrigger>
            <TabsTrigger value="agendamento-rapido">Agendamento Rápido</TabsTrigger>
          </TabsList>

          <TabsContent value="consultas">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-hopecann-teal" />
                Minhas Consultas
              </h2>
              
              {error && <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>}
              
              {loading ? <div className="py-8 text-center text-gray-500">Carregando agendamentos...</div> : appointments.length > 0 ? <AppointmentsList appointments={appointments} /> : <Card>
                  <CardContent className="py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhuma consulta agendada</h3>
                      <p className="text-gray-500 max-w-sm mb-4">
                        Você não possui consultas agendadas. Configure sua disponibilidade para começar a receber agendamentos.
                      </p>
                    </div>
                  </CardContent>
                </Card>}
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
    </div>;
};

export default AgendaMedica;
