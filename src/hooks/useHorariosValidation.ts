import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useHorariosValidation = () => {
  const [loading, setLoading] = useState(false);

  const validateTimeSlot = useCallback(async (
    medicoId: number,
    dataHora: Date
  ): Promise<{ isValid: boolean; message?: string }> => {
    setLoading(true);
    
    try {
      const dayOfWeek = format(dataHora, 'EEEE', { locale: ptBR }).toLowerCase();
      const timeStr = format(dataHora, 'HH:mm');
      const dateStr = format(dataHora, 'yyyy-MM-dd');
      
      // 1. Verificar se o médico tem horários configurados para este dia
      const { data: horariosDisponiveis, error: horariosError } = await supabase
        .from('horarios_disponiveis')
        .select('*')
        .eq('id_medico', medicoId)
        .eq('dia_semana', dayOfWeek);

      if (horariosError) {
        console.error('Erro ao verificar horários disponíveis:', horariosError);
        return { isValid: false, message: 'Erro ao verificar disponibilidade' };
      }

      // 2. Se não há horários configurados, permitir apenas horários comerciais
      if (!horariosDisponiveis || horariosDisponiveis.length === 0) {
        const hour = parseInt(timeStr.split(':')[0]);
        if (hour < 8 || hour >= 17) {
          return { 
            isValid: false, 
            message: 'Horário fora do expediente padrão (8h às 17h)' 
          };
        }
      } else {
        // 3. Verificar se o horário está dentro dos períodos configurados
        const isWithinSchedule = horariosDisponiveis.some(horario => {
          const inicio = parseInt(horario.hora_inicio.split(':')[0]) * 60 + 
                        parseInt(horario.hora_inicio.split(':')[1]);
          const fim = parseInt(horario.hora_fim.split(':')[0]) * 60 + 
                     parseInt(horario.hora_fim.split(':')[1]);
          const current = parseInt(timeStr.split(':')[0]) * 60 + 
                         parseInt(timeStr.split(':')[1]);
          
          return current >= inicio && current < fim;
        });

        if (!isWithinSchedule) {
          return { 
            isValid: false, 
            message: 'Horário fora dos períodos de atendimento configurados' 
          };
        }
      }

      // 4. Verificar se já existe consulta agendada para este horário
      const { data: consultasExistentes, error: consultasError } = await supabase
        .from('consultas')
        .select('id, status')
        .eq('id_medico', medicoId)
        .gte('data_hora', `${dateStr}T${timeStr}:00`)
        .lt('data_hora', `${dateStr}T${timeStr}:30`)
        .neq('status', 'cancelada');

      if (consultasError) {
        console.error('Erro ao verificar consultas existentes:', consultasError);
        return { isValid: false, message: 'Erro ao verificar conflitos de horário' };
      }

      if (consultasExistentes && consultasExistentes.length > 0) {
        return { 
          isValid: false, 
          message: 'Já existe uma consulta agendada para este horário' 
        };
      }

      return { isValid: true };
      
    } catch (error) {
      console.error('Erro na validação de horário:', error);
      return { isValid: false, message: 'Erro interno na validação' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { validateTimeSlot, loading };
};