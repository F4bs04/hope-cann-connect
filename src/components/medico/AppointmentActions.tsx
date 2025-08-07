import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, Clock, Video, MapPin } from 'lucide-react';

interface AppointmentActionsProps {
  appointment: {
    id: string;
    status: string;
    scheduled_at: string;
    reason: string;
    consultation_type: string;
    patient_id: string;
    notes?: string;
  };
  patientName: string;
  onStatusChange?: () => void;
}

export const AppointmentActions: React.FC<AppointmentActionsProps> = ({
  appointment,
  patientName,
  onStatusChange
}) => {
  const [loading, setLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const getStatusBadge = () => {
    const statusConfig = {
      scheduled: { label: 'Aguardando Confirmação', variant: 'secondary' as const, icon: Clock },
      confirmed: { label: 'Confirmada', variant: 'default' as const, icon: Check },
      in_progress: { label: 'Em Andamento', variant: 'destructive' as const, icon: Video },
      completed: { label: 'Realizada', variant: 'outline' as const, icon: Check },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const, icon: X },
      no_show: { label: 'Paciente Faltou', variant: 'destructive' as const, icon: X }
    };

    const config = statusConfig[appointment.status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;

    return (
      <Badge variant={config?.variant || 'secondary'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config?.label || appointment.status}
      </Badge>
    );
  };

  const handleConfirmAppointment = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointment.id);

      if (error) throw error;

      // Buscar user_id do paciente para notificação
      const { data: patientData } = await supabase
        .from('patients')
        .select('user_id')
        .eq('id', appointment.patient_id)
        .single();

      // Enviar notificação de confirmação
      if (patientData?.user_id) {
        const { createAppointmentConfirmedNotification } = await import('@/services/notifications/notificationService');
        await createAppointmentConfirmedNotification(
          patientData.user_id,
          'Médico', // Pode ser melhorado para pegar o nome real do médico
          format(new Date(appointment.scheduled_at), 'dd/MM/yyyy', { locale: ptBR }),
          format(new Date(appointment.scheduled_at), 'HH:mm')
        );
      }

      toast.success('Consulta confirmada com sucesso!');
      onStatusChange?.();
    } catch (error) {
      console.error('Erro ao confirmar consulta:', error);
      toast.error('Erro ao confirmar consulta');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          notes: cancelReason ? `Cancelado: ${cancelReason}` : 'Cancelado pelo médico'
        })
        .eq('id', appointment.id);

      if (error) throw error;

      // Buscar user_id do paciente para notificação
      const { data: patientData } = await supabase
        .from('patients')
        .select('user_id')
        .eq('id', appointment.patient_id)
        .single();

      // Enviar notificação de cancelamento
      if (patientData?.user_id) {
        const { createAppointmentCancelledNotification } = await import('@/services/notifications/notificationService');
        await createAppointmentCancelledNotification(
          patientData.user_id,
          'patient',
          {
            doctorName: 'Médico',
            date: format(new Date(appointment.scheduled_at), 'dd/MM/yyyy', { locale: ptBR }),
            time: format(new Date(appointment.scheduled_at), 'HH:mm'),
            reason: cancelReason
          }
        );
      }

      toast.success('Consulta cancelada com sucesso!');
      setCancelReason('');
      onStatusChange?.();
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error);
      toast.error('Erro ao cancelar consulta');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAppointment = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'in_progress' })
        .eq('id', appointment.id);

      if (error) throw error;

      toast.success('Consulta iniciada!');
      onStatusChange?.();
    } catch (error) {
      console.error('Erro ao iniciar consulta:', error);
      toast.error('Erro ao iniciar consulta');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAppointment = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointment.id);

      if (error) throw error;

      toast.success('Consulta finalizada!');
      onStatusChange?.();
    } catch (error) {
      console.error('Erro ao finalizar consulta:', error);
      toast.error('Erro ao finalizar consulta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Informações da consulta */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{patientName}</h3>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{format(new Date(appointment.scheduled_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
            <div className="flex items-center gap-1">
              {appointment.consultation_type === 'telemedicine' ? (
                <><Video className="h-3 w-3" /> Teleconsulta</>
              ) : (
                <><MapPin className="h-3 w-3" /> Presencial</>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{appointment.reason}</p>
        </div>
      </div>

      {/* Ações baseadas no status */}
      <div className="flex gap-2 flex-wrap">
        {appointment.status === 'scheduled' && (
          <>
            <Button
              onClick={handleConfirmAppointment}
              disabled={loading}
              size="sm"
              className="flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              Confirmar
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <X className="h-3 w-3" />
                  Cancelar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar Consulta</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja cancelar esta consulta? O paciente será notificado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="cancel-reason">Motivo do cancelamento (opcional)</Label>
                  <Input
                    id="cancel-reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Ex: Emergência médica, reagendamento necessário..."
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCancelAppointment}
                    disabled={loading}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {loading ? 'Cancelando...' : 'Cancelar Consulta'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {appointment.status === 'confirmed' && (
          <>
            <Button
              onClick={handleStartAppointment}
              disabled={loading}
              size="sm"
              className="flex items-center gap-1"
            >
              <Video className="h-3 w-3" />
              Iniciar Consulta
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <X className="h-3 w-3" />
                  Cancelar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar Consulta</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja cancelar esta consulta confirmada? O paciente será notificado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="cancel-reason">Motivo do cancelamento (opcional)</Label>
                  <Input
                    id="cancel-reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Ex: Emergência médica, reagendamento necessário..."
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCancelAppointment}
                    disabled={loading}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {loading ? 'Cancelando...' : 'Cancelar Consulta'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {appointment.status === 'in_progress' && (
          <Button
            onClick={handleCompleteAppointment}
            disabled={loading}
            size="sm"
            className="flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            Finalizar Consulta
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentActions;