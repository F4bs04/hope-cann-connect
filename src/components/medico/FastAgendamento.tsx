import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Plus } from 'lucide-react';

interface FastAgendamentoProps {
  onSuccess?: () => void;
}

const FastAgendamento: React.FC<FastAgendamentoProps> = ({ onSuccess }) => {
  const { userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [patientEmail, setPatientEmail] = useState<string>("");
  const [reason, setReason] = useState<string>("");
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
          status: 'scheduled' as const,
          consultation_type: 'in_person' as const
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
          <Plus className="h-5 w-5" />
          Agendamento Rápido
        </CardTitle>
        <CardDescription>
          Agende uma consulta rapidamente para um paciente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
            <Label>Motivo da Consulta *</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descrição do motivo"
            />
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
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Data da Consulta *</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date()}
            locale={ptBR}
            className="rounded-md border"
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={loading || !selectedDate || !selectedTime || !patientName || !patientEmail || !reason}
          className="w-full"
        >
          {loading ? "Agendando..." : "Agendar Consulta"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FastAgendamento;