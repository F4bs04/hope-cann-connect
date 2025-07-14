import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeSlot {
  time: string;
  available: boolean;
}

export const useAvailableTimeSlots = (doctorId: number | null, selectedDate: Date | null) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doctorId || !selectedDate) {
      // Horários padrão quando não há médico ou data selecionada
      const defaultSlots = [
        "08:00", "09:00", "10:00", "11:00", 
        "13:00", "14:00", "15:00", "16:00", "17:00"
      ].map(time => ({ time, available: true }));
      
      setTimeSlots(defaultSlots);
      return;
    }

    const fetchAvailableSlots = async () => {
      setLoading(true);
      try {
        const dayOfWeek = format(selectedDate, 'EEEE', { locale: ptBR }).toLowerCase();
        
        // Buscar horários disponíveis do médico para o dia da semana
        const { data: horariosDisponiveis, error: horariosError } = await supabase
          .from('horarios_disponiveis')
          .select('*')
          .eq('id_medico', doctorId)
          .eq('dia_semana', dayOfWeek);

        if (horariosError) {
          console.error('Erro ao buscar horários disponíveis:', horariosError);
          setTimeSlots([]);
          return;
        }

        // Buscar consultas já agendadas para esta data
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const { data: consultasAgendadas, error: consultasError } = await supabase
          .from('consultas')
          .select('data_hora')
          .eq('id_medico', doctorId)
          .gte('data_hora', `${dateStr}T00:00:00`)
          .lt('data_hora', `${dateStr}T23:59:59`)
          .eq('status', 'agendada');

        if (consultasError) {
          console.error('Erro ao buscar consultas agendadas:', consultasError);
        }

        // Gerar slots baseados na disponibilidade
        const slots: TimeSlot[] = [];
        const ocupados = new Set(
          (consultasAgendadas || []).map(consulta => 
            format(new Date(consulta.data_hora), 'HH:mm')
          )
        );

        if (horariosDisponiveis && horariosDisponiveis.length > 0) {
          // Se o médico tem horários configurados, usar eles
          horariosDisponiveis.forEach(horario => {
            const inicio = parseInt(horario.hora_inicio.split(':')[0]);
            const fim = parseInt(horario.hora_fim.split(':')[0]);
            
            // Gerar slots de 30 em 30 minutos
            for (let hour = inicio; hour < fim; hour++) {
              for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push({
                  time,
                  available: !ocupados.has(time)
                });
              }
            }
          });
        } else {
          // Horários completos do dia se não há configuração específica (7h às 18h)
          for (let hour = 7; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
              // Pular horário de almoço (12:00 - 13:30)
              if (hour === 12 && minute === 0) continue;
              if (hour === 12 && minute === 30) continue;
              if (hour === 13 && minute === 0) continue;
              
              const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              slots.push({
                time,
                available: !ocupados.has(time)
              });
            }
          }
        }

        setTimeSlots(slots.sort((a, b) => a.time.localeCompare(b.time)));
      } catch (error) {
        console.error('Erro ao buscar slots disponíveis:', error);
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [doctorId, selectedDate]);

  return { timeSlots, loading };
};