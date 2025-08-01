import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

interface AgendamentoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AgendamentoForm: React.FC<AgendamentoFormProps> = ({ onSuccess, onCancel }) => {
  const { userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [patientEmail, setPatientEmail] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [consultationType, setConsultationType] = useState<string>("in_person");
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
  ];

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !patientName || !patientEmail || !reason) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      // Buscar o médico pelo user_id
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userProfile?.id)
        .single();

      if (doctorError || !doctorData) {
        toast.error('Médico não encontrado');
        return;
      }

      // Criar ou buscar paciente pelo email
      let patientId = null;
      const { data: existingPatient } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', patientEmail)
        .single();

      if (existingPatient) {
        // Buscar dados do paciente
        const { data: patientData } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', existingPatient.id)
          .single();
        
        patientId = patientData?.id;
      }

      // Se não existe paciente, apenas criar o agendamento com as informações básicas
      if (!patientId) {
        toast.error('Paciente não encontrado. O paciente deve estar cadastrado no sistema.');
        return;
      }

      // Criar a consulta
      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          doctor_id: doctorData.id,
          patient_id: patientId,
          scheduled_at: scheduledAt.toISOString(),
          reason: reason,
          notes: notes || null,
          status: 'scheduled' as const,
          consultation_type: consultationType as 'in_person' | 'telemedicine'
        });

      if (appointmentError) {
        console.error('Erro ao criar consulta:', appointmentError);
        toast.error('Erro ao agendar consulta');
        return;
      }

      toast.success('Consulta agendada com sucesso!');
      
      // Limpar formulário
      setSelectedDate(undefined);
      setSelectedTime("");
      setPatientName("");
      setPatientEmail("");
      setReason("");
      setNotes("");
      setConsultationType("in_person");
      
      onSuccess?.();
    } catch (error) {
      console.error('Erro no agendamento:', error);
      toast.error('Erro inesperado ao agendar consulta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Agendar Nova Consulta
        </CardTitle>
        <CardDescription>
          Preencha os dados para agendar uma nova consulta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome do Paciente *</Label>
            <Input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Nome completo do paciente"
            />
          </div>

          <div className="space-y-2">
            <Label>Email do Paciente *</Label>
            <Input
              type="email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Consulta</Label>
            <Select value={consultationType} onValueChange={setConsultationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">Presencial</SelectItem>
                <SelectItem value="telemedicine">Teleconsulta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Horário *</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {time}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Motivo da Consulta *</Label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Descrição do motivo da consulta"
          />
        </div>

        <div className="space-y-2">
          <Label>Observações</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações adicionais (opcional)"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Data da Consulta *</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date()}
            locale={ptBR}
            className="rounded-md border w-full"
          />
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleSubmit}
            disabled={loading || !selectedDate || !selectedTime || !patientName || !patientEmail || !reason}
            className="flex-1"
          >
            {loading ? "Agendando..." : "Agendar Consulta"}
          </Button>
          
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgendamentoForm;