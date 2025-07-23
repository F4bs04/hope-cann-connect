import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getHorariosByDiaSemana } from '@/services/horarios/horariosService';

interface TimeSlot {
  time: string;
  available: boolean;
}

export const useAvailableTimeSlots = (doctorId: number | null, selectedDate: Date | null) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doctorId || !selectedDate) {
      // Horários padrão de 6h às 19h30 com intervalos de 30 minutos
      const defaultSlots = [];
      for (let hour = 6; hour <= 19; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 19 && minute === 30) {
            defaultSlots.push({ time: "19:30", available: true });
            break;
          }
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          defaultSlots.push({ time, available: true });
        }
      }
      
      setTimeSlots(defaultSlots);
      return;
    }

    const fetchAvailableSlots = async () => {
      setLoading(true);
      try {
        const dayOfWeek = format(selectedDate, 'EEEE', { locale: ptBR }).toLowerCase();
        
        // Mapeamento de dias da semana
        const dayMapping: { [key: string]: string } = {
          'segunda-feira': 'segunda-feira',
          'terça-feira': 'terça-feira', 
          'quarta-feira': 'quarta-feira',
          'quinta-feira': 'quinta-feira',
          'sexta-feira': 'sexta-feira',
          'sábado': 'sábado',
          'domingo': 'domingo'
        };
        
        const normalizedDay = dayMapping[dayOfWeek] || dayOfWeek;
        
        // Buscar horários disponíveis do médico para o dia da semana usando serviço
        const { data: horariosDisponiveis, error: horariosError } = await getHorariosByDiaSemana(doctorId, normalizedDay);

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
          .in('status', ['agendada', 'confirmada', 'em_andamento']);

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
            const inicioMin = parseInt(horario.hora_inicio.split(':')[1]);
            const fim = parseInt(horario.hora_fim.split(':')[0]);
            const fimMin = parseInt(horario.hora_fim.split(':')[1]);
            
            let currentHour = inicio;
            let currentMin = inicioMin;
            
            // Gerar slots de 30 em 30 minutos
            while (currentHour < fim || (currentHour === fim && currentMin < fimMin)) {
              const time = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
              slots.push({
                time,
                available: !ocupados.has(time) // Marcar como indisponível se já ocupado
              });
              
              currentMin += 30;
              if (currentMin >= 60) {
                currentMin = 0;
                currentHour++;
              }
            }
          });
        }
        // Se o médico não cadastrou horários disponíveis, não mostra nenhum slot

        setTimeSlots(slots.sort((a, b) => a.time.localeCompare(b.time)));
      } catch (error) {
        console.error('Erro ao buscar slots disponíveis:', error);
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
    
    // Set up real-time subscription for consultas changes
    const channel = supabase
      .channel('consultas_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultas',
          filter: `id_medico=eq.${doctorId}`
        },
        () => {
          // Refetch slots when a consultation is added/updated/deleted
          fetchAvailableSlots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorId, selectedDate]);

  return { timeSlots, loading };
};