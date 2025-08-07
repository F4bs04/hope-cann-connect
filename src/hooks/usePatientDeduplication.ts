import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DuplicatePatient {
  patient_id: string;
  full_name: string;
  cpf: string;
  email: string;
  birth_date: string;
  match_type: string;
  confidence_score: number;
}

interface MergeRequest {
  sourcePatientId: string;
  targetPatientId: string;
  reason: string;
  confidenceScore: number;
}

export const usePatientDeduplication = () => {
  const [duplicates, setDuplicates] = useState<DuplicatePatient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const { toast } = useToast();

  const detectDuplicates = useCallback(async (userProfile?: any) => {
    setIsLoading(true);
    try {
      if (!userProfile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        userProfile = profile;
      }

      if (!userProfile?.email) {
        throw new Error('Email do usuário não encontrado');
      }

      // Buscar pacientes sem user_id que podem ser do mesmo usuário
      const { data: duplicatePatients, error } = await supabase
        .from('patients')
        .select('id, full_name, cpf, birth_date, user_id')
        .is('user_id', null)
        .or(`cpf.eq.${userProfile.email},full_name.ilike.%${userProfile.full_name || ''}%`);

      if (error) throw error;

      const duplicates: DuplicatePatient[] = (duplicatePatients || []).map((patient: any) => ({
        patient_id: patient.id,
        full_name: patient.full_name || '',
        cpf: patient.cpf || '',
        email: userProfile.email,
        birth_date: patient.birth_date || '',
        match_type: patient.cpf === userProfile.email ? 'email' : 'name',
        confidence_score: patient.cpf === userProfile.email ? 0.9 : 0.7
      }));
      
      setDuplicates(duplicates);
      
      toast({
        title: "Detecção Executada",
        description: `Processo de detecção concluído. ${duplicates.length} registros de paciente encontrados.`,
      });

      return duplicates;
    } catch (error: any) {
      console.error('Erro ao detectar duplicatas:', error);
      toast({
        title: "Erro",
        description: "Erro ao detectar registros de paciente.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const mergePatients = useCallback(async (mergeRequest: MergeRequest) => {
    setIsMerging(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Atualizar o paciente para associá-lo ao usuário autenticado
      const { error: updateError } = await supabase
        .from('patients')
        .update({ user_id: user.id })
        .eq('id', mergeRequest.sourcePatientId);

      if (updateError) throw updateError;

      // Remover da lista de duplicatas
      setDuplicates(prev => prev.filter(
        dup => dup.patient_id !== mergeRequest.sourcePatientId
      ));
      
      toast({
        title: "Unificação Realizada",
        description: "Registro de paciente unificado com sucesso. Agora você pode ver todos os seus documentos.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao unificar pacientes:', error);
      toast({
        title: "Erro na Unificação",
        description: "Erro ao unificar registros de paciente. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsMerging(false);
    }
  }, [toast]);

  const getMergeHistory = useCallback(async () => {
    try {
      // TODO: Replace with actual query once patient_merges table is available in types
      // Simulate empty history for now
      const mockHistory: any[] = [];
      return mockHistory;
    } catch (error: any) {
      console.error('Erro ao buscar histórico de merges:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de merges.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  return {
    duplicates,
    isLoading,
    isMerging,
    detectDuplicates,
    mergePatients,
    getMergeHistory
  };
};