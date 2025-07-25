import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeSlot {
  id?: number;
  day: string;
  time: string;
  available: boolean;
  isBooked?: boolean;
}

interface AgendaSlotsManagerProps {
  medicoId: number;
}

const AgendaSlotsManager: React.FC<AgendaSlotsManagerProps> = ({ medicoId }) => {
  const { toast } = useToast();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);

  const diasSemana = [
    'segunda-feira', 'terça-feira', 'quarta-feira', 
    'quinta-feira', 'sexta-feira', 'sábado', 'domingo'
  ];

  const horariosPadrao = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  // Carregar horários disponíveis e consultas agendadas
  useEffect(() => {
    loadAvailableSlots();
    loadBookedSlots();
  }, [medicoId, currentWeek]);

  const loadAvailableSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('horarios_disponiveis')
        .select('*')
        .eq('id_medico', medicoId);

      if (error) throw error;

      // Converter horários para slots por dia/hora
      const availableSlots: TimeSlot[] = [];
      data?.forEach(horario => {
        const startTime = horario.hora_inicio;
        const endTime = horario.hora_fim;
        
        // Gerar slots de 30 em 30 minutos
        for (let time of horariosPadrao) {
          if (time >= startTime && time <= endTime) {
            availableSlots.push({
              id: horario.id,
              day: horario.dia_semana,
              time: time,
              available: true
            });
          }
        }
      });

      setSlots(availableSlots);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookedSlots = async () => {
    try {
      const startOfWeekDate = currentWeek;
      const endOfWeekDate = addDays(currentWeek, 6);

    const { data, error } = await supabase
      .from('appointments')
        .select('*')
        .eq('id_medico', medicoId)
        .gte('data_hora', startOfWeekDate.toISOString())
        .lte('data_hora', endOfWeekDate.toISOString())
        .in('status', ['agendada', 'confirmada']);

      if (error) throw error;
      setBookedSlots(data || []);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
    }
  };

  const addTimeSlot = () => {
    if (!selectedDay || !selectedTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um dia da semana e horário",
        variant: "destructive"
      });
      return;
    }

    // Verificar se já existe
    const exists = slots.some(slot => 
      slot.day === selectedDay && slot.time === selectedTime
    );

    if (exists) {
      toast({
        title: "Horário já existe",
        description: "Este horário já está na sua agenda",
        variant: "destructive"
      });
      return;
    }

    const newSlot: TimeSlot = {
      day: selectedDay,
      time: selectedTime,
      available: true
    };

    setSlots([...slots, newSlot]);
    setSelectedDay('');
    setSelectedTime('');
  };

  const removeTimeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const saveSlots = async () => {
    try {
      setIsLoading(true);

      // Primeiro, remover todos os horários antigos
      await supabase
        .from('horarios_disponiveis')
        .delete()
        .eq('id_medico', medicoId);

      // Agrupar slots por dia
      const slotsByDay = slots.reduce((acc, slot) => {
        if (!acc[slot.day]) {
          acc[slot.day] = [];
        }
        acc[slot.day].push(slot.time);
        return acc;
      }, {} as Record<string, string[]>);

      // Inserir novos horários agrupados
      const horariosToInsert = Object.entries(slotsByDay).map(([day, times]) => {
        const sortedTimes = times.sort();
        return {
          id_medico: medicoId,
          dia_semana: day,
          hora_inicio: sortedTimes[0],
          hora_fim: sortedTimes[sortedTimes.length - 1]
        };
      });

      if (horariosToInsert.length > 0) {
    const { error } = await supabase
      .from('doctor_schedules')
          .insert(horariosToInsert);

        if (error) throw error;
      }

      toast({
        title: "Horários salvos!",
        description: "Sua agenda foi atualizada com sucesso"
      });

      loadAvailableSlots();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isSlotBooked = (day: string, time: string, date: Date) => {
    return bookedSlots.some(consulta => {
      const consultaDate = parseISO(consulta.data_hora);
      const consultaTime = format(consultaDate, 'HH:mm');
      return isSameDay(consultaDate, date) && consultaTime === time;
    });
  };

  const getWeekDates = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando agenda...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gerenciar Slots de Atendimento
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Defina os horários que ficam disponíveis para agendamento dos pacientes
          </p>
        </CardHeader>
      </Card>

      {/* Adicionar novo slot */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adicionar Horário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium mb-2">Dia da Semana</label>
              <select 
                value={selectedDay} 
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Selecione o dia</option>
                {diasSemana.map(dia => (
                  <option key={dia} value={dia}>
                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-32">
              <label className="block text-sm font-medium mb-2">Horário</label>
              <select 
                value={selectedTime} 
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Selecione o horário</option>
                {horariosPadrao.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button onClick={addTimeSlot} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de slots */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Horários Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum horário configurado</p>
              <p className="text-sm">Adicione seus horários de atendimento acima</p>
            </div>
          ) : (
            <div className="space-y-4">
              {diasSemana.map(dia => {
                const slotsForDay = slots.filter(slot => slot.day === dia);
                if (slotsForDay.length === 0) return null;

                return (
                  <div key={dia} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 capitalize">{dia}</h4>
                    <div className="flex flex-wrap gap-2">
                      {slotsForDay.map((slot, index) => (
                        <div key={`${slot.day}-${slot.time}-${index}`} className="flex items-center gap-2">
                          <Badge variant="outline" className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {slot.time}
                            <button
                              onClick={() => removeTimeSlot(slots.indexOf(slot))}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {slots.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <Button onClick={saveSlots} className="flex items-center gap-2" disabled={isLoading}>
                <Save className="h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview da semana */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview da Semana</CardTitle>
          <p className="text-sm text-muted-foreground">
            Visualize como seus horários ficam disponíveis para os pacientes
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-sm">
            {getWeekDates().map((date, index) => (
              <div key={index} className="border rounded p-2">
                <div className="font-medium text-center mb-2">
                  {format(date, 'EEE', { locale: ptBR })}
                  <br />
                  {format(date, 'dd/MM')}
                </div>
                <div className="space-y-1">
                  {slots
                    .filter(slot => slot.day === diasSemana[index])
                    .map((slot, slotIndex) => {
                      const isBooked = isSlotBooked(slot.day, slot.time, date);
                      return (
                        <div 
                          key={slotIndex}
                          className={`text-xs p-1 rounded text-center ${
                            isBooked 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {slot.time}
                          {isBooked && ' (Ocupado)'}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaSlotsManager;