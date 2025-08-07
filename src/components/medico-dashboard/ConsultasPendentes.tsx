import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppointmentActions } from '@/components/medico/AppointmentActions';
import { Clock, AlertCircle } from 'lucide-react';

interface PendingAppointment {
  id: string;
  scheduled_at: string;
  reason: string;
  consultation_type: string;
  status: string;
  notes?: string;
  patient: {
    id: string;
    full_name: string;
    user_id: string;
  };
}

export const ConsultasPendentes: React.FC = () => {
  const { userProfile } = useAuth();
  const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPendingAppointments = async () => {
    if (!userProfile?.id) return;

    try {
      // Buscar médico
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userProfile.id)
        .single();

      if (!doctorData) return;

      // Buscar consultas pendentes
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_at,
          reason,
          consultation_type,
          status,
          notes,
          patient_id,
          patients (
            id,
            full_name,
            user_id
          )
        `)
        .eq('doctor_id', doctorData.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString()) // Apenas futuras
        .order('scheduled_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar consultas pendentes:', error);
        return;
      }

      const formattedAppointments = appointments?.map(apt => ({
        ...apt,
        patient: {
          id: apt.patients?.id || '',
          full_name: apt.patients?.full_name || 'Nome não disponível',
          user_id: apt.patients?.user_id || ''
        }
      })) || [];

      setPendingAppointments(formattedAppointments);
    } catch (error) {
      console.error('Erro ao carregar consultas pendentes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingAppointments();
  }, [userProfile?.id]);

  const handleStatusChange = () => {
    loadPendingAppointments(); // Recarregar quando status mudar
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Consultas Pendentes de Confirmação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Consultas Pendentes de Confirmação
          </div>
          {pendingAppointments.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {pendingAppointments.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma consulta aguardando confirmação</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {pendingAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <AppointmentActions
                      appointment={{
                        id: appointment.id,
                        status: appointment.status,
                        scheduled_at: appointment.scheduled_at,
                        reason: appointment.reason,
                        consultation_type: appointment.consultation_type,
                        patient_id: appointment.patient.id,
                        notes: appointment.notes
                      }}
                      patientName={appointment.patient.full_name}
                      onStatusChange={handleStatusChange}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsultasPendentes;