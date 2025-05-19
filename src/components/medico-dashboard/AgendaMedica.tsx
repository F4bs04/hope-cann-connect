import React, { useState, useEffect } from 'react';
import { DoctorScheduleProvider } from '@/contexts/DoctorScheduleContext';
import AgendaTab from '@/components/medico/AgendaTab';
import FastAgendamento from '@/components/medico/FastAgendamento';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import AppointmentsList from '@/components/medico/AppointmentsList';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import AgendamentoForm from '@/components/medico/AgendamentoForm';

const AgendaMedica: React.FC = () => {
  console.log('[AgendaMedica] Component rendered/re-rendered.');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    console.log('[AgendaMedica] fetchAppointments called.');
    setLoading(true);
    setError(null);
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      console.log('[AgendaMedica] Supabase session:', session);
      if (!session) {
        setError("Você precisa estar logado para visualizar sua agenda");
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para acessar esta página."
        });
        console.warn('[AgendaMedica] No session, navigating to login.');
        navigate('/login');
        setLoading(false);
        return;
      }
      
      console.log('[AgendaMedica] Fetching userData from usuarios for email:', session.user.email);
      const {
        data: userData,
        error: userError
      } = await supabase.from('usuarios').select('id').eq('email', session.user.email).single();
      if (userError) {
        console.error('[AgendaMedica] Error fetching userData:', userError);
        throw userError;
      }
      console.log('[AgendaMedica] UserData from usuarios:', userData);
      
      if (!userData || !userData.id) {
        console.error('[AgendaMedica] No user ID found in userData.');
        throw new Error("ID do usuário não encontrado na tabela usuarios.");
      }

      console.log('[AgendaMedica] Fetching doctorData from medicos for id_usuario:', userData.id);
      const {
        data: doctorData,
        error: doctorError
      } = await supabase.from('medicos').select('id').eq('id_usuario', userData.id).single();
      if (doctorError) {
        console.error('[AgendaMedica] Error fetching doctorData:', doctorError);
        throw doctorError;
      }
      console.log('[AgendaMedica] DoctorData from medicos:', doctorData);

      if (!doctorData || !doctorData.id) {
        console.error('[AgendaMedica] No doctor ID found in doctorData.');
        throw new Error("ID do médico não encontrado na tabela medicos.");
      }

      console.log('[AgendaMedica] Fetching appointmentsData for id_medico:', doctorData.id);
      const {
        data: appointmentsData,
        error: appointmentsError
      } = await supabase.from('consultas').select(`
          id,
          data_hora,
          motivo,
          status,
          tipo_consulta,
          repeticao,
          dias_semana,
          dia_mes,
          pacientes_app:id_paciente (id, nome)
        `).eq('id_medico', doctorData.id).order('data_hora', {
        ascending: true
      });
      
      if (appointmentsError) {
        console.error('[AgendaMedica] Error fetching appointmentsData:', appointmentsError);
        throw appointmentsError;
      }
      
      console.log('[AgendaMedica] AppointmentsData fetched:', appointmentsData);
      setAppointments(appointmentsData || []);
    } catch (error: any) {
      console.error("[AgendaMedica] Erro ao buscar agendamentos:", error);
      setError(error.message || "Ocorreu um erro ao buscar seus agendamentos");
    } finally {
      setLoading(false);
      console.log('[AgendaMedica] fetchAppointments finished. Loading:', false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    const appointmentsChannel = supabase.channel('appointments-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'consultas'
    }, payload => {
      console.log('[AgendaMedica] Supabase realtime change detected on consultas table:', payload);
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
                        console.log('[AgendaMedica] Agendamento rápido concluído, atualizando consultas...');
                        await fetchAppointments();
                      } catch (error) {
                        console.error('[AgendaMedica] Error refreshing appointments after fast agendamento:', error);
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
