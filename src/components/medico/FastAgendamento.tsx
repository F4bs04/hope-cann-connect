
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FastAgendamentoProps {
  consultationDuration: string;
  onAgendamentoRapido: (data: { dia: Date; horario: string }) => void;
  fullWidth?: boolean;
}

const FastAgendamento: React.FC<FastAgendamentoProps> = ({ 
  consultationDuration, 
  onAgendamentoRapido,
  fullWidth = false
}) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>('');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const handleSchedule = async () => {
    if (!date || !time || !patientName) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Por favor, selecione a data, horário e o nome do paciente",
      });
      return;
    }

    setLoading(true);
    try {
      // Get current doctor ID
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Você precisa estar logado para agendar consultas");
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
      
      // Check if patient exists or create a new one
      let patientId;
      const { data: existingPatient } = await supabase
        .from('pacientes_app')
        .select('id')
        .eq('nome', patientName)
        .eq('email', patientEmail || null)
        .maybeSingle();
        
      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        // Create new patient
        const { data: newPatient, error: patientError } = await supabase
          .from('pacientes_app')
          .insert({
            nome: patientName,
            email: patientEmail || null,
            idade: 0 // Default value since we don't have age information
          })
          .select('id')
          .single();
          
        if (patientError) {
          throw patientError;
        }
        
        patientId = newPatient.id;
      }
      
      // Create appointment
      const appointmentDate = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      const { error: appointmentError } = await supabase
        .from('consultas')
        .insert({
          id_medico: doctorData.id,
          id_paciente: patientId,
          data_hora: appointmentDate.toISOString(),
          status: 'agendada',
          motivo: 'Agendamento rápido',
          tipo_consulta: 'Consulta padrão'
        });
        
      if (appointmentError) {
        throw appointmentError;
      }
      
      // Success!
      onAgendamentoRapido({ dia: date, horario: time });
      toast({
        title: "Consulta agendada",
        description: "A consulta foi agendada com sucesso!",
      });
      
      // Reset form
      setPatientName('');
      setPatientEmail('');
      setTime('');
      
    } catch (error: any) {
      console.error("Erro ao agendar consulta:", error);
      toast({
        variant: "destructive",
        title: "Erro ao agendar",
        description: error.message || "Ocorreu um erro ao agendar a consulta",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient-name">Nome do Paciente</Label>
          <Input 
            id="patient-name" 
            placeholder="Nome completo do paciente" 
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="patient-email">Email do Paciente (opcional)</Label>
          <Input 
            id="patient-email" 
            type="email" 
            placeholder="Email do paciente" 
            value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data da Consulta</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              className="rounded-md border"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Horário</Label>
            <Select onValueChange={setTime} value={time}>
              <SelectTrigger>
                <SelectValue placeholder="Horário" />
              </SelectTrigger>
              <SelectContent>
                {availableTimes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 border rounded-md p-2 bg-muted/20 mt-4">
              <Clock className="h-4 w-4 text-hopecann-teal" />
              <span className="text-sm text-gray-600">
                Duração da consulta: {consultationDuration} minutos
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleSchedule} 
        disabled={loading}
        className={cn(fullWidth && "w-full")}
      >
        {loading ? "Agendando..." : "Agendar Consulta"}
      </Button>
    </div>
  );
};

export default FastAgendamento;
