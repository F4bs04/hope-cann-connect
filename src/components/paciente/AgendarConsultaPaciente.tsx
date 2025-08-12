import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DoctorAvailabilityService from '@/services/doctorAvailability/doctorAvailabilityService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';

interface AgendarConsultaPacienteProps {
  selectedDoctorId?: string | null;
  onSuccess?: () => void;
}

const AgendarConsultaPaciente: React.FC<AgendarConsultaPacienteProps> = ({ 
  selectedDoctorId, 
  onSuccess 
}) => {
  const { userProfile, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { timeSlots, loading: slotsLoading } = useAvailableTimeSlots(
    selectedDoctorId || undefined, 
    selectedDate
  );

  const [availableDays, setAvailableDays] = useState<Date[]>([]);

  useEffect(() => {
    const fetchAvailableDays = async () => {
      if (!selectedDoctorId) {
        setAvailableDays([]);
        return;
      }
      try {
        const schedule = await DoctorAvailabilityService.loadDoctorSchedule(selectedDoctorId);
        const weekdayMap: Record<string, number> = {
          sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
        };
        const activeWeekdays = new Set<number>();
        (schedule || []).forEach((d: any) => {
          if (d?.isActive && d.slots?.some((s: any) => s?.isActive)) {
            const idx = weekdayMap[d.day as keyof typeof weekdayMap];
            if (idx !== undefined) activeWeekdays.add(idx);
          }
        });

        const days: Date[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < 60; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          if (date.getDay() === 0) continue; // pular domingos
          if (activeWeekdays.has(date.getDay())) {
            days.push(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
          }
        }
        setAvailableDays(days);
      } catch (e) {
        console.error('Erro ao carregar disponibilidade do médico:', e);
        setAvailableDays([]);
      }
    };

    fetchAvailableDays();
  }, [selectedDoctorId]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset selected time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctorId || !userProfile) {
      toast.error('Por favor, selecione data, horário e certifique-se de estar logado');
      return;
    }

    setLoading(true);
    
    try {
      // Buscar dados do paciente
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', userProfile.id)
        .single();

      if (patientError || !patientData) {
        toast.error('Dados do paciente não encontrados. Complete seu cadastro primeiro.');
        return;
      }

      // Criar datetime para agendamento
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      // Criar agendamento
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          doctor_id: selectedDoctorId,
          patient_id: patientData.id,
          scheduled_at: appointmentDateTime.toISOString(),
          reason: 'Consulta agendada via sistema',
          status: 'scheduled', // Status inicial: aguardando confirmação do médico
          consultation_type: 'in_person'
        });

      if (appointmentError) {
        console.error('Erro ao criar agendamento:', appointmentError);
        const msg = (appointmentError as any)?.message?.toString().toLowerCase() || '';
        const isOverlap = msg.includes('appointments_no_overlapping') || msg.includes('overlap') || msg.includes('conflict');
        if (isOverlap) {
          toast.info('Horário indisponível. Por favor, escolha outro.');
          setSelectedTime(null);
        } else {
          toast.error('Erro ao agendar consulta: ' + (appointmentError as any)?.message);
        }
        return;
      }

      // Buscar dados do médico para notificação
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('user_id')
        .eq('id', selectedDoctorId)
        .single();

      // Enviar notificação para o médico
      if (doctorData?.user_id) {
        const { createAppointmentScheduledNotification } = await import('@/services/notifications/notificationService');
        await createAppointmentScheduledNotification(
          doctorData.user_id,
          userProfile.full_name || userProfile.email,
          format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }),
          selectedTime
        );
      }

      toast.success('Consulta agendada com sucesso! Aguarde a confirmação do médico.');
      onSuccess?.();
      
    } catch (error: any) {
      console.error('Erro ao agendar consulta:', error);
      toast.error('Erro ao agendar consulta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Faça login para agendar uma consulta</p>
        </CardContent>
      </Card>
    );
  }

  if (!selectedDoctorId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Selecione um médico para agendar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Selecione a Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
            locale={ptBR}
            className="rounded-md border"
            modifiers={{ hasSlots: availableDays }}
            modifiersClassNames={{
              hasSlots: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-primary"
            }}
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horários Disponíveis
              <Badge variant="outline">
                {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slotsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Carregando horários...</p>
              </div>
            ) : timeSlots.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                Nenhum horário disponível para esta data
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    disabled={!slot.available}
                    onClick={() => handleTimeSelect(slot.time)}
                    className="w-full"
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedDate && selectedTime && (
        <Card>
          <CardHeader>
            <CardTitle>Confirmar Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Resumo do Agendamento:</h4>
              <p><strong>Data:</strong> {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}</p>
              <p><strong>Horário:</strong> {selectedTime}</p>
            </div>
            
            <Button 
              onClick={handleConfirmAppointment}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgendarConsultaPaciente;