import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';

interface HorarioDisponivel {
  id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
}

export function useHorariosManager() {
  const { userInfo, loading: loadingUser } = useCurrentUserInfo();
  const { toast } = useToast();
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchHorarios = async () => {
    if (!userInfo.medicoId) {
      console.log('Médico ID não encontrado:', userInfo);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Buscando horários para médico ID:', userInfo.medicoId);
      
      const { data, error } = await supabase
        .from('horarios_disponiveis')
        .select('*')
        .eq('id_medico', userInfo.medicoId)
        .order('dia_semana', { ascending: true });

      if (error) {
        console.error('Erro SQL:', error);
        throw error;
      }
      
      console.log('Horários encontrados:', data);
      setHorarios(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar horários:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar horários",
        description: "Não foi possível carregar seus horários disponíveis.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo.medicoId && !loadingUser) {
      fetchHorarios();
    }
  }, [userInfo.medicoId, loadingUser]);

  const adicionarHorario = async (diaAtual: string, horaInicio: string, horaFim: string) => {
    if (!userInfo.medicoId) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Médico não identificado. Faça login novamente.",
      });
      return false;
    }

    if (!diaAtual || !horaInicio || !horaFim) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Preencha todos os campos do horário",
      });
      return false;
    }

    if (horaInicio >= horaFim) {
      toast({
        variant: "destructive",
        title: "Horário inválido", 
        description: "A hora de início deve ser antes da hora de fim",
      });
      return false;
    }

    // Verificar sobreposição
    const overlapping = horarios.some(h => 
      h.dia_semana === diaAtual && 
      ((horaInicio >= h.hora_inicio && horaInicio < h.hora_fim) || 
       (horaFim > h.hora_inicio && horaFim <= h.hora_fim) ||
       (horaInicio <= h.hora_inicio && horaFim >= h.hora_fim))
    );

    if (overlapping) {
      toast({
        variant: "destructive",
        title: "Horário sobreposto",
        description: "Este horário se sobrepõe a outro já adicionado no mesmo dia",
      });
      return false;
    }

    try {
      setSaving(true);
      console.log('Adicionando horário:', { id_medico: userInfo.medicoId, dia_semana: diaAtual, hora_inicio: horaInicio, hora_fim: horaFim });
      
      const { data, error } = await supabase
        .from('horarios_disponiveis')
        .insert({
          id_medico: userInfo.medicoId,
          dia_semana: diaAtual,
          hora_inicio: horaInicio,
          hora_fim: horaFim
        })
        .select()
        .single();

      if (error) {
        console.error('Erro SQL ao inserir:', error);
        throw error;
      }

      console.log('Horário inserido com sucesso:', data);
      setHorarios([...horarios, data]);
      
      // Atualizar status de disponibilidade do médico
      await supabase
        .from('medicos')
        .update({ status_disponibilidade: true })
        .eq('id', userInfo.medicoId);

      toast({
        title: "Horário adicionado",
        description: "Seu horário foi adicionado e já está disponível para agendamentos.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar horário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar horário",
        description: error.message || "Não foi possível adicionar o horário. Tente novamente.",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const removerHorario = async (id: number) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('horarios_disponiveis')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHorarios(horarios.filter(h => h.id !== id));
      
      toast({
        title: "Horário removido",
        description: "O horário foi removido da sua disponibilidade.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao remover horário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover horário",
        description: "Não foi possível remover o horário. Tente novamente.",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    horarios,
    loading: loading || loadingUser,
    saving,
    adicionarHorario,
    removerHorario,
    refetch: fetchHorarios
  };
}