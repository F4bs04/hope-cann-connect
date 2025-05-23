
import React, { useState } from 'react';
import { format, parseISO, isToday, isTomorrow, isThisWeek, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, FileText, X, CheckCircle, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { verificarChatAtivo } from '@/services/supabaseService';

interface Appointment {
  id: number;
  data_hora: string;
  motivo?: string;
  status: 'agendada' | 'realizada' | 'cancelada';
  tipo_consulta?: string;
  pacientes_app?: {
    id: number;
    nome: string;
  };
}

interface AppointmentsListProps {
  appointments: Appointment[];
  onChatWithPatient?: (appointment: Appointment) => void;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments, onChatWithPatient }) => {
  const { toast } = useToast();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para controlar os botões de chat
  const [chatButtonsStatus, setChatButtonsStatus] = useState<Record<number, boolean>>({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-blue-100 text-blue-800';
      case 'realizada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancellingId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('consultas')
        .update({ status: 'cancelada' })
        .eq('id', cancellingId);
        
      if (error) throw error;
      
      toast({
        title: "Consulta cancelada",
        description: "A consulta foi cancelada com sucesso",
      });
      
      setCancelDialogOpen(false);
      setCancellingId(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao cancelar consulta",
        description: error.message || "Ocorreu um erro ao cancelar a consulta"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const confirmCancel = (id: number) => {
    setCancellingId(id);
    setCancelDialogOpen(true);
  };

  const handleChatClick = (appointment: Appointment) => {
    if (onChatWithPatient && appointment.pacientes_app) {
      onChatWithPatient(appointment);
    }
  };

  // Verificar status de chat para consultas realizadas
  React.useEffect(() => {
    const checkChatStatus = async () => {
      const completedAppointments = appointments.filter(apt => apt.status === 'realizada');
      
      for (const apt of completedAppointments) {
        if (apt.pacientes_app?.id) {
          // Assumindo que o ID do médico é 1 para fins de demonstração
          const medicoId = 1;
          const isChatActive = await verificarChatAtivo(medicoId, apt.pacientes_app.id);
          setChatButtonsStatus(prev => ({
            ...prev,
            [apt.id]: isChatActive
          }));
        }
      }
    };
    
    checkChatStatus();
  }, [appointments]);

  // Group appointments by time periods
  const today = appointments.filter(apt => 
    isToday(new Date(apt.data_hora)) && apt.status !== 'cancelada'
  );
  
  const tomorrow = appointments.filter(apt => 
    isTomorrow(new Date(apt.data_hora)) && apt.status !== 'cancelada'
  );
  
  const thisWeek = appointments.filter(apt => 
    isThisWeek(new Date(apt.data_hora)) && 
    !isToday(new Date(apt.data_hora)) && 
    !isTomorrow(new Date(apt.data_hora)) &&
    apt.status !== 'cancelada'
  );
  
  const future = appointments.filter(apt => 
    isAfter(new Date(apt.data_hora), new Date()) && 
    !isThisWeek(new Date(apt.data_hora)) &&
    apt.status !== 'cancelada'
  );
  
  const past = appointments.filter(apt => 
    new Date(apt.data_hora) < new Date() && apt.status === 'realizada'
  );
  
  const cancelled = appointments.filter(apt => 
    apt.status === 'cancelada'
  );

  const renderAppointmentGroup = (title: string, list: Appointment[]) => {
    if (list.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">{title}</h3>
        <div className="space-y-3">
          {list.map(appointment => (
            <Card key={appointment.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-hopecann-teal w-full md:w-2 p-0 md:p-0"></div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold flex items-center">
                          <User className="h-4 w-4 mr-2 text-hopecann-teal" />
                          {appointment.pacientes_app?.nome || "Paciente"}
                        </h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(appointment.data_hora), "dd 'de' MMMM', ' yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Clock className="h-4 w-4 mr-2" />
                          {format(new Date(appointment.data_hora), "HH:mm", { locale: ptBR })}
                        </p>
                        {appointment.tipo_consulta && (
                          <Badge variant="outline" className="mt-2">
                            {appointment.tipo_consulta}
                          </Badge>
                        )}
                      </div>
                      <Badge className={`${getStatusColor(appointment.status)}`}>
                        {appointment.status === 'agendada' ? 'Agendada' : 
                         appointment.status === 'realizada' ? 'Realizada' : 'Cancelada'}
                      </Badge>
                    </div>
                    
                    {appointment.motivo && (
                      <div className="mt-3 text-sm">
                        <p className="text-gray-500 flex items-start">
                          <FileText className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                          <span>{appointment.motivo}</span>
                        </p>
                      </div>
                    )}
                    
                    {appointment.status === 'agendada' && (
                      <div className="mt-3 flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => confirmCancel(appointment.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-2 text-green-500 hover:text-green-700"
                          onClick={() => {
                            // Mark as completed functionality would go here
                            toast({
                              title: "Consulta concluída",
                              description: "A consulta foi marcada como realizada"
                            });
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      </div>
                    )}
                    
                    {appointment.status === 'realizada' && onChatWithPatient && appointment.pacientes_app && (
                      <div className="mt-3 flex justify-end">
                        {chatButtonsStatus[appointment.id] !== undefined && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-hopecann-teal"
                            disabled={!chatButtonsStatus[appointment.id]}
                            onClick={() => handleChatClick(appointment)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {chatButtonsStatus[appointment.id] ? 'Conversar' : 'Chat expirado'}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderAppointmentGroup("Hoje", today)}
      {renderAppointmentGroup("Amanhã", tomorrow)}
      {renderAppointmentGroup("Esta semana", thisWeek)}
      {renderAppointmentGroup("Futuras", future)}
      {renderAppointmentGroup("Anteriores", past)}
      {renderAppointmentGroup("Canceladas", cancelled)}
      
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar consulta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={loading}>
              Voltar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelAppointment}
              disabled={loading}
            >
              {loading ? "Cancelando..." : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsList;
