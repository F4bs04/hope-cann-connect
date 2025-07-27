import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type TimeSlot = {
  time: string;
  available: boolean;
};
export const useAvailableTimeSlots = (doctorId?: string, selectedDate?: Date) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId || !selectedDate) {
      setTimeSlots([]);
      return;
    }
    setLoading(true);
    setError(null);
    const fetchSlots = async () => {
      try {
        // Obter dia da semana
        const diasSemana = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
        const dayOfWeek = diasSemana[selectedDate.getDay()];

        // Buscar horários cadastrados do médico para o dia da semana
        const { data: schedules, error: schError } = await supabase
          .from('horarios_disponiveis')
          .select('hora_inicio, hora_fim')
          .eq('id_medico', doctorId)
          .eq('dia_semana', dayOfWeek)
          .eq('status_disponibilidade', true);
        if (schError) throw schError;
        if (!schedules || schedules.length === 0) {
          setTimeSlots([]);
          setLoading(false);
          return;
        }

        // Gerar todos os horários possíveis no intervalo
        const slots: string[] = [];
        schedules.forEach((sch: any) => {
          let start = sch.hora_inicio;
          let end = sch.hora_fim;
          let [hStart, mStart] = start.split(':').map(Number);
          let [hEnd, mEnd] = end.split(':').map(Number);
          let current = new Date(selectedDate);
          current.setHours(hStart, mStart, 0, 0);
          const endDate = new Date(selectedDate);
          endDate.setHours(hEnd, mEnd, 0, 0);
          while (current <= endDate) {
            slots.push(current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            current.setMinutes(current.getMinutes() + 30);
          }
        });

        // Buscar consultas já agendadas para o médico e data
        const dateStr = selectedDate.toISOString().split('T')[0];
        const { data: consultas, error: appError } = await supabase
          .from('consultas')
          .select('data_hora')
          .eq('id_medico', doctorId)
          .gte('data_hora', dateStr + 'T00:00:00')
          .lte('data_hora', dateStr + 'T23:59:59');
        if (appError) throw appError;
        const ocupados = consultas?.map((a: any) => {
          const d = new Date(a.data_hora);
          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }) || [];

        // Marcar horários ocupados
        const result = slots.map(time => ({ time, available: !ocupados.includes(time) }));
        setTimeSlots(result);
      } catch (err: any) {
        setError(err.message);
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [doctorId, selectedDate]);

  return { timeSlots, loading, error, refresh: () => {} };
};