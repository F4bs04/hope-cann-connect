import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek, isSameDay, parseISO, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface Doctor {
  id: number;
  nome: string;
  especialidade: string;
  foto_perfil?: string;
  valor_por_consulta: number;
}

interface AvailableSlot {
  doctorId: number;
  date: Date;
  time: string;
  isAvailable: boolean;
}

interface Consultation {
  id_medico: number;
  id_paciente: number;
  data_hora: string;
  motivo: string;
  tipo_consulta: string;
}

const SmartScheduling: React.FC = () => {
  const { toast } = useToast();
  const { userProfile, isAuthenticated } = useUnifiedAuth();
  
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [consultationType, setConsultationType] = useState<string>('primeira_consulta');
  const [reason, setReason] = useState<string>('');
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date()));
  const [isLoading, setIsLoading] = useState(false);

  // Carregar médicos
  useEffect(() => {
    loadDoctors();
  }, []);

  // Carregar slots quando médico é selecionado
  useEffect(() => {
    if (selectedDoctor) {
      loadAvailableSlots(selectedDoctor.id);
    }
  }, [selectedDoctor, currentWeek]);

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('medicos')
        .select('*')
        .eq('aprovado', true)
        .eq('status_disponibilidade', true);

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
      toast({
        title: "Erro ao carregar médicos",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    }
  };

  const loadAvailableSlots = async (doctorId: number) => {
    try {
      setIsLoading(true);
      
      // Buscar horários disponíveis do médico
      const { data: horarios, error: horariosError } = await supabase
        .from('horarios_disponiveis')
        .select('*')
        .eq('id_medico', doctorId);

      if (horariosError) throw horariosError;

      // Buscar consultas já agendadas
      const startOfWeekDate = currentWeek;
      const endOfWeekDate = addDays(currentWeek, 6);

      const { data: consultas, error: consultasError } = await supabase
        .from('consultas')
        .select('data_hora')
        .eq('id_medico', doctorId)
        .gte('data_hora', startOfWeekDate.toISOString())
        .lte('data_hora', endOfWeekDate.toISOString())
        .in('status', ['agendada', 'confirmada']);

      if (consultasError) throw consultasError;

      // Gerar slots disponíveis
      const slots: AvailableSlot[] = [];
      const bookedTimes = new Set(
        consultas?.map(c => format(parseISO(c.data_hora), 'yyyy-MM-dd HH:mm')) || []
      );

      const diasSemana = [
        'segunda-feira', 'terça-feira', 'quarta-feira', 
        'quinta-feira', 'sexta-feira', 'sábado', 'domingo'
      ];

      for (let i = 0; i < 7; i++) {
        const date = addDays(currentWeek, i);
        const dayName = diasSemana[i];
        
        // Pular dias passados
        if (isBefore(date, new Date()) && !isSameDay(date, new Date())) {
          continue;
        }

        // Encontrar horários do médico para este dia
        const daySchedule = horarios?.find(h => h.dia_semana === dayName);
        if (!daySchedule) continue;

        // Gerar slots de 30 em 30 minutos
        const timeSlots = generateTimeSlots(daySchedule.hora_inicio, daySchedule.hora_fim);
        
        timeSlots.forEach(time => {
          const slotKey = format(date, 'yyyy-MM-dd') + ' ' + time;
          const isAvailable = !bookedTimes.has(slotKey);
          
          slots.push({
            doctorId,
            date,
            time,
            isAvailable
          });
        });
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Erro ao carregar slots:', error);
      toast({
        title: "Erro ao carregar horários",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeSlots = (startTime: string, endTime: string) => {
    const slots = [];
    let current = startTime;
    
    while (current <= endTime) {
      slots.push(current);
      
      // Adicionar 30 minutos
      const [hours, minutes] = current.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + 30;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      
      if (newHours >= 24) break;
      current = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    }
    
    return slots;
  };

  const handleBookConsultation = async () => {
    if (!selectedDoctor || !selectedSlot || !userProfile) {
      toast({
        title: "Dados incompletos",
        description: "Verifique se todos os campos estão preenchidos",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);

      // Criar data/hora da consulta
      const consultationDateTime = new Date(selectedSlot.date);
      const [hours, minutes] = selectedSlot.time.split(':').map(Number);
      consultationDateTime.setHours(hours, minutes, 0, 0);

      // Inserir consulta
      const { error } = await supabase
        .from('consultas')
        .insert({
          id_medico: selectedDoctor.id,
          id_paciente: userProfile.id,
          data_hora: consultationDateTime.toISOString(),
          motivo: reason,
          tipo_consulta: consultationType,
          status: 'agendada',
          valor_consulta: selectedDoctor.valor_por_consulta
        });

      if (error) throw error;

      toast({
        title: "Consulta agendada!",
        description: `Sua consulta foi marcada para ${format(consultationDateTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
      });

      // Reset form
      setStep(1);
      setSelectedDoctor(null);
      setSelectedSlot(null);
      setReason('');
      
    } catch (error) {
      console.error('Erro ao agendar:', error);
      toast({
        title: "Erro ao agendar",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekDates = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  };

  const nextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const prevWeek = () => {
    const newWeek = addDays(currentWeek, -7);
    if (isAfter(newWeek, new Date()) || isSameDay(newWeek, new Date())) {
      setCurrentWeek(newWeek);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Login necessário</h3>
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para agendar uma consulta
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Fazer Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNumber 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
            </div>
            {stepNumber < 4 && (
              <div className={`w-12 h-1 mx-2 ${
                step > stepNumber ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Selecionar Médico */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Escolha um Médico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDoctor?.id === doctor.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{doctor.nome}</h3>
                      <p className="text-sm text-muted-foreground">{doctor.especialidade}</p>
                      <p className="text-sm font-medium text-primary">
                        R$ {doctor.valor_por_consulta?.toFixed(2) || '0,00'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedDoctor && (
              <Button 
                onClick={() => setStep(2)} 
                className="w-full mt-4"
              >
                Continuar
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Selecionar Horário */}
      {step === 2 && selectedDoctor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Escolha Data e Horário - {selectedDoctor.nome}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={prevWeek}>
                ← Semana Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                {format(currentWeek, "dd/MM", { locale: ptBR })} - {format(addDays(currentWeek, 6), "dd/MM/yyyy", { locale: ptBR })}
              </span>
              <Button variant="outline" size="sm" onClick={nextWeek}>
                Próxima Semana →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando horários...</p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {getWeekDates().map((date, index) => {
                  const daySlots = availableSlots.filter(slot => 
                    isSameDay(slot.date, date) && slot.isAvailable
                  );
                  
                  return (
                    <div key={index} className="border rounded p-2">
                      <div className="text-center font-medium text-sm mb-2">
                        {format(date, 'EEE', { locale: ptBR })}
                        <br />
                        {format(date, 'dd/MM')}
                      </div>
                      <div className="space-y-1">
                        {daySlots.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center">
                            Indisponível
                          </p>
                        ) : (
                          daySlots.map((slot, slotIndex) => (
                            <Button
                              key={slotIndex}
                              variant={selectedSlot === slot ? "default" : "outline"}
                              size="sm"
                              className="w-full text-xs h-7"
                              onClick={() => setSelectedSlot(slot)}
                            >
                              {slot.time}
                            </Button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              {selectedSlot && (
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continuar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Informações da Consulta */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Informações da Consulta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Consulta
              </label>
              <select 
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="primeira_consulta">Primeira Consulta</option>
                <option value="retorno">Retorno</option>
                <option value="acompanhamento">Acompanhamento</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Motivo da Consulta
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Descreva brevemente o motivo da consulta..."
                className="w-full p-2 border rounded-md h-24 resize-none"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Voltar
              </Button>
              <Button 
                onClick={() => setStep(4)} 
                className="flex-1"
                disabled={!reason.trim()}
              >
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmação */}
      {step === 4 && selectedDoctor && selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle>Confirmar Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Médico:</span>
                <span className="font-medium">{selectedDoctor.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Data:</span>
                <span className="font-medium">
                  {format(selectedSlot.date, "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Horário:</span>
                <span className="font-medium">{selectedSlot.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tipo:</span>
                <span className="font-medium">
                  {consultationType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Valor:</span>
                <span className="font-medium">
                  R$ {selectedDoctor.valor_por_consulta?.toFixed(2) || '0,00'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Voltar
              </Button>
              <Button 
                onClick={handleBookConsultation} 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartScheduling;