import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DoctorAvailabilityService from '@/services/doctorAvailability/doctorAvailabilityService';

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
        console.log('=== BUSCANDO HORÁRIOS DISPONÍVEIS ===');
        console.log('Doctor ID:', doctorId);
        console.log('Selected Date:', selectedDate);
        
        // Obter dia da semana
        const diasSemana = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = diasSemana[selectedDate.getDay()];
        console.log('Day of week:', dayOfWeek);

        // Buscar horários configurados pelo médico usando nosso serviço
        const doctorSchedule = await DoctorAvailabilityService.loadDoctorSchedule(doctorId);
        console.log('Doctor schedule loaded:', doctorSchedule);
        
        if (!doctorSchedule || doctorSchedule.length === 0) {
          console.log('Nenhuma agenda configurada pelo médico');
          setTimeSlots([]);
          setLoading(false);
          return;
        }

        // Encontrar horários para o dia da semana selecionado
        const daySchedule = doctorSchedule.find(day => day.day === dayOfWeek);
        
        if (!daySchedule || !daySchedule.isActive || daySchedule.slots.length === 0) {
          console.log('Médico não atende neste dia da semana');
          setTimeSlots([]);
          setLoading(false);
          return;
        }

        console.log('Slots found for day:', daySchedule.slots);

        // Gerar todos os horários possíveis baseados nos slots configurados
        const availableSlots: string[] = [];
        
        daySchedule.slots.forEach(slot => {
          if (!slot.isActive) return;
          
          const [startHour, startMin] = slot.startTime.split(':').map(Number);
          const [endHour, endMin] = slot.endTime.split(':').map(Number);
          
          let current = new Date(selectedDate);
          current.setHours(startHour, startMin, 0, 0);
          
          const endTime = new Date(selectedDate);
          endTime.setHours(endHour, endMin, 0, 0);
          
          // Gerar slots de 30 em 30 minutos
          while (current < endTime) {
            const timeString = current.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            });
            availableSlots.push(timeString);
            current.setMinutes(current.getMinutes() + 30);
          }
        });

        console.log('Generated time slots:', availableSlots);

        // Buscar consultas já agendadas para verificar disponibilidade
        const dateStr = selectedDate.toISOString().split('T')[0];
        console.log('Checking appointments for date:', dateStr);
        
        // Buscar na tabela appointments (nome correto da tabela)
        const { data: appointments, error: appError } = await supabase
          .from('appointments')
          .select('scheduled_at')
          .eq('doctor_id', doctorId)
          .gte('scheduled_at', dateStr + 'T00:00:00')
          .lte('scheduled_at', dateStr + 'T23:59:59');
          
        if (appError) {
          console.warn('Erro ao buscar consultas agendadas:', appError);
          // Continuar mesmo com erro, apenas não filtrar horários ocupados
        }

        const ocupados = appointments?.map((appointment: any) => {
          const d = new Date(appointment.scheduled_at);
          return d.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        }) || [];

        console.log('Occupied slots:', ocupados);

        // Criar resultado final com disponibilidade
        const result = availableSlots.map(time => ({
          time,
          available: !ocupados.includes(time)
        }));

        console.log('Final result:', result);
        setTimeSlots(result);
        
      } catch (err: any) {
        console.error('Erro ao buscar horários disponíveis:', err);
        setError(err.message || 'Erro ao carregar horários disponíveis');
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSlots();
  }, [doctorId, selectedDate]);

  return { 
    timeSlots, 
    loading, 
    error, 
    refresh: () => {
      if (doctorId && selectedDate) {
        setLoading(true);
        setError(null);
      }
    }
  };
};