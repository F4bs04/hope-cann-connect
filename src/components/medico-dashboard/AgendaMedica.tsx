
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
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';

const AgendaMedica: React.FC = () => {
  console.log('[AgendaMedica] Component rendered/re-rendered.');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userInfo, loading: loadingUserInfo, error: userError } = useCurrentUserInfo();

  const fetchAppointments = async (medicoId: number) => {
    console.log('[AgendaMedica] fetchAppointments called for medicoId:', medicoId);
    setLoadingAppointments(true);
    setAppointmentsError(null);
    try {
      console.log('[AgendaMedica] Fetching appointmentsData for id_medico:', medicoId);
      const { data: appointmentsData, error: appointmentsFetchError } = await supabase
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
        .eq('id_medico', medicoId)
        .order('data_hora', { ascending: true });
      
      if (appointmentsFetchError) {
        console.error('[AgendaMedica] Error fetching appointmentsData:', appointmentsFetchError);
        throw appointmentsFetchError;
      }
      
      console.log('[AgendaMedica] AppointmentsData fetched:', appointmentsData);
      setAppointments(appointmentsData || []);
    } catch (error: any) {
      console.error("[AgendaMedica] Erro ao buscar agendamentos:", error);
      setAppointmentsError(error.message || "Ocorreu um erro ao buscar seus agendamentos");
    } finally {
      setLoadingAppointments(false);
      console.log('[AgendaMedica] fetchAppointments finished. LoadingAppointments:', false);
    }
  };

  useEffect(() => {
    if (!loadingUserInfo) {
      if (userError) {
        console.error('[AgendaMedica] User info error:', userError);
        setAppointmentsError(`Erro ao carregar dados do usuário: ${userError}`);
        setLoadingAppointments(false);
      } else if (userInfo.medicoId) {
        console.log('[AgendaMedica] MedicoId encontrado no userInfo:', userInfo.medicoId);
        fetchAppointments(userInfo.medicoId);
      } else {
        // Verificar se temos medicoId no localStorage como fallback
        const medicoIdFromLocalStorage = localStorage.getItem('medicoId');
        if (medicoIdFromLocalStorage) {
          console.log('[AgendaMedica] Usando medicoId do localStorage:', medicoIdFromLocalStorage);
          fetchAppointments(Number(medicoIdFromLocalStorage));
        } else if (userInfo.userType && userInfo.userType !== 'medico') {
          setAppointmentsError("Usuário não é um médico. Acesso à agenda negado.");
          setLoadingAppointments(false);
          console.warn('[AgendaMedica] User is not a medico. Type:', userInfo.userType);
        } else if (!userInfo.id && !userInfo.email) {
          setAppointmentsError("Informações do usuário não encontradas. Por favor, faça login.");
          setLoadingAppointments(false);
          toast({
            variant: "destructive",
            title: "Erro de autenticação",
            description: "Você precisa estar logado para acessar esta página."
          });
        } else {
          setAppointmentsError("Não foi possível identificar o perfil de médico. Verifique seu cadastro.");
          setLoadingAppointments(false);
          console.warn('[AgendaMedica] Medico ID not found in userInfo or localStorage, though user info might exist:', userInfo);
        }
      }
    }
  }, [userInfo, loadingUserInfo, userError, navigate, toast]);

  useEffect(() => {
    // Get medicoId from userInfo or localStorage
    const medicoId = userInfo.medicoId || (localStorage.getItem('medicoId') ? Number(localStorage.getItem('medicoId')) : null);
    
    // Only subscribe if we have a medicoId
    if (!medicoId) return;

    const appointmentsChannel = supabase
      .channel('custom-all-channel_agenda_medica_consultas')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'consultas', filter: `id_medico=eq.${medicoId}` },
        (payload) => {
          console.log('[AgendaMedica] Supabase realtime change detected on consultas table:', payload);
          if (medicoId) { // Re-check medicoId before fetching
            fetchAppointments(medicoId);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(appointmentsChannel);
    };
  }, [userInfo.medicoId]); // Depend on medicoId to re-subscribe if it changes

  if (loadingUserInfo) {
    return <div className="py-8 text-center text-gray-500">Carregando informações do usuário...</div>;
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
              
              {appointmentsError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{appointmentsError}</AlertDescription>
                </Alert>
              )}
              
              {loadingAppointments ? (
                <div className="py-8 text-center text-gray-500">Carregando agendamentos...</div>
              ) : !appointmentsError && appointments.length > 0 ? (
                <AppointmentsList appointments={appointments} />
              ) : !appointmentsError ? (
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
              ) : null}
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
                  <AgendamentoForm 
                    onSuccess={() => {
                      // Get medicoId from userInfo or localStorage
                      const medicoId = userInfo.medicoId || (localStorage.getItem('medicoId') ? Number(localStorage.getItem('medicoId')) : null);
                      if (medicoId) fetchAppointments(medicoId);
                    }} 
                  />
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
                        // Get medicoId from userInfo or localStorage
                        const medicoId = userInfo.medicoId || (localStorage.getItem('medicoId') ? Number(localStorage.getItem('medicoId')) : null);
                        if (medicoId) await fetchAppointments(medicoId);
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
    </div>
  );
};

export default AgendaMedica;
