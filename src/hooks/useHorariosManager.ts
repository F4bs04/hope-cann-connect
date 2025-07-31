import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Horario {
  id: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
  doctor_id: string;
}

export const useHorariosManager = () => {
  const { userProfile } = useAuth();
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHorarios = async () => {
    if (!userProfile?.id) return;

    setLoading(true);
    setError(null);
    
    try {
      // Buscar o médico pelo user_id
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userProfile.id)
        .single();

      if (doctorError || !doctorData) {
        console.log('Médico não encontrado ou erro:', doctorError);
        setHorarios([]);
        return;
      }

      // Buscar horários do médico
      const { data, error } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_id', doctorData.id)
        .eq('is_active', true);

      if (error) {
        console.error('Erro ao carregar horários:', error);
        setError(error.message);
        return;
      }

      const formattedHorarios = data?.map(schedule => ({
        id: schedule.id,
        dia_semana: schedule.day_of_week,
        hora_inicio: schedule.start_time,
        hora_fim: schedule.end_time,
        doctor_id: schedule.doctor_id
      })) || [];

      setHorarios(formattedHorarios);
    } catch (err: any) {
      console.error('Erro ao carregar horários:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mapeamento de dias da semana
  const dayMapping: Record<string, 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'> = {
    'segunda-feira': 'monday',
    'terça-feira': 'tuesday', 
    'quarta-feira': 'wednesday',
    'quinta-feira': 'thursday',
    'sexta-feira': 'friday',
    'sábado': 'saturday',
    'domingo': 'sunday',
    'monday': 'monday',
    'tuesday': 'tuesday',
    'wednesday': 'wednesday', 
    'thursday': 'thursday',
    'friday': 'friday',
    'saturday': 'saturday',
    'sunday': 'sunday'
  };

  const adicionarHorario = async (dia: string, horaInicio: string, horaFim: string): Promise<boolean> => {
    if (!userProfile?.id) return false;

    setSaving(true);
    
    try {
      // Buscar o médico pelo user_id
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userProfile.id)
        .single();

      if (doctorError || !doctorData) {
        toast.error('Médico não encontrado');
        return false;
      }

      // Mapear o dia da semana para o formato correto
      const mappedDay = dayMapping[dia];
      if (!mappedDay) {
        toast.error('Dia da semana inválido');
        return false;
      }

      // Inserir novo horário
      const { error } = await supabase
        .from('doctor_schedules')
        .insert({
          doctor_id: doctorData.id,
          day_of_week: mappedDay,
          start_time: horaInicio,
          end_time: horaFim,
          is_active: true
        });

      if (error) {
        console.error('Erro ao adicionar horário:', error);
        toast.error('Erro ao adicionar horário');
        return false;
      }

      toast.success('Horário adicionado com sucesso!');
      await loadHorarios(); // Recarregar lista
      return true;
    } catch (err: any) {
      console.error('Erro ao adicionar horário:', err);
      toast.error('Erro ao adicionar horário');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const removerHorario = async (id: string): Promise<boolean> => {
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('doctor_schedules')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover horário:', error);
        toast.error('Erro ao remover horário');
        return false;
      }

      toast.success('Horário removido com sucesso!');
      await loadHorarios(); // Recarregar lista
      return true;
    } catch (err: any) {
      console.error('Erro ao remover horário:', err);
      toast.error('Erro ao remover horário');
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadHorarios();
  }, [userProfile?.id]);

  return {
    horarios,
    loading,
    saving,
    isLoading: loading,
    error,
    createHorario: adicionarHorario,
    updateHorario: () => {},
    deleteHorario: removerHorario,
    loadHorarios,
    adicionarHorario,
    removerHorario
  };
};