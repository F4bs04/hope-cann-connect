
import React, { useState, useEffect } from 'react';
import { DoctorScheduleProvider } from '@/contexts/DoctorScheduleContext';
import AgendaTab from '@/components/medico/AgendaTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppointmentsList from '@/components/medico/AppointmentsList';

const AgendaMedica: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        // Get current doctor ID
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError("Você precisa estar logado para visualizar sua agenda");
          setLoading(false);
          return;
        }
        
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', session.user.email)
          .single();
          
        if (userError) {
          throw userError;
        }
        
        const { data: doctorData, error: doctorError } = await supabase
          .from('medicos')
          .select('id')
          .eq('id_usuario', userData.id)
          .single();
          
        if (doctorError) {
          throw doctorError;
        }
        
        // Get doctor's appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('consultas')
          .select(`
            id,
            data_hora,
            motivo,
            status,
            tipo_consulta,
            pacientes_app:id_paciente (id, nome)
          `)
          .eq('id_medico', doctorData.id)
          .order('data_hora', { ascending: true });
          
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
    
    fetchAppointments();
    
    // Set up real-time subscription for appointments
    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'consultas' }, 
        (payload) => {
          // Refresh appointments when there's a change
          fetchAppointments();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(appointmentsChannel);
    };
  }, []);

  return (
    <div className="space-y-6">
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
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {loading ? (
                <div className="py-8 text-center text-gray-500">Carregando agendamentos...</div>
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
          <TabsContent value="configurar">
            <AgendaTab />
          </TabsContent>
          <TabsContent value="agendamento-rapido">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-hopecann-teal" />
                Agendamento Rápido
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Novo Agendamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="fast-schedule-container">
                      <AgendaTab isQuickMode={true} />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Próximas Consultas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="py-4 text-center text-gray-500">Carregando...</div>
                    ) : appointments.filter(apt => new Date(apt.data_hora) > new Date()).length > 0 ? (
                      <div className="space-y-3">
                        {appointments
                          .filter(apt => new Date(apt.data_hora) > new Date())
                          .slice(0, 5)
                          .map(appointment => (
                            <div key={appointment.id} className="flex justify-between items-center p-2 border-b">
                              <div>
                                <p className="font-medium">{appointment.pacientes_app?.nome || 'Paciente'}</p>
                                <p className="text-sm text-gray-600">
                                  {format(new Date(appointment.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                {appointment.status || "Agendada"}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Nenhuma consulta agendada
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DoctorScheduleProvider>
    </div>
  );
};

export default AgendaMedica;
