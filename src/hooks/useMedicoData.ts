
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';
import { useToast } from '@/hooks/use-toast';

interface MedicoProfile {
  id: number;
  nome: string;
  crm: string;
  especialidade: string;
  foto_perfil?: string;
  biografia?: string;
  valor_por_consulta?: number;
  telefone: string;
  aprovado: boolean;
  status_disponibilidade: boolean;
}

export function useMedicoData() {
  const [medicoProfile, setMedicoProfile] = useState<MedicoProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userInfo, loading: userLoading } = useCurrentUserInfo();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMedicoData = async () => {
      try {
        if (userLoading || !userInfo.medicoId) return;

        setIsLoading(true);

        const { data: medicoData, error } = await supabase
          .from('medicos')
          .select('*')
          .eq('id', userInfo.medicoId)
          .single();

        if (error) throw error;

        setMedicoProfile(medicoData);
      } catch (error) {
        console.error('Erro ao carregar dados do médico:', error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar os dados do médico.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicoData();
  }, [userInfo, userLoading, toast]);

  const updateMedicoProfile = async (updates: Partial<MedicoProfile>) => {
    try {
      if (!userInfo.medicoId) throw new Error('ID do médico não encontrado');

      const { error } = await supabase
        .from('medicos')
        .update(updates)
        .eq('id', userInfo.medicoId);

      if (error) throw error;

      setMedicoProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil do médico:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive"
      });
    }
  };

  return {
    medicoProfile,
    isLoading,
    updateMedicoProfile,
    refetch: () => fetchMedicoData()
  };
}
