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
        const dateStr = selectedDate.toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('doctor_schedules')
          .select('time')
          .eq('doctor_id', doctorId)
          .eq('date', dateStr);
        if (error) throw error;
        setTimeSlots(data?.map((slot: any) => slot.time) || []);
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