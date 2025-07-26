import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAvailableTimeSlots = (doctorId?: string, selectedDate?: Date) => {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
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
          .from('doctor_schedules')
          .select('start_time, end_time')
          .eq('doctor_id', doctorId)
          .eq('day_of_week', dayOfWeek)
          .eq('is_active', true);
        if (schError) throw schError;
        if (!schedules || schedules.length === 0) {
          setTimeSlots([]);
          setLoading(false);
          return;
        }

        // Gerar todos os horários possíveis no intervalo
        const slots: string[] = [];
        schedules.forEach((sch: any) => {
          let start = sch.start_time;
          let end = sch.end_time;
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
        const { data: appointments, error: appError } = await supabase
          .from('appointments')
          .select('scheduled_at')
          .eq('doctor_id', doctorId)
          .gte('scheduled_at', dateStr + 'T00:00:00')
          .lte('scheduled_at', dateStr + 'T23:59:59');
        if (appError) throw appError;
        const ocupados = appointments?.map((a: any) => {
          const d = new Date(a.scheduled_at);
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