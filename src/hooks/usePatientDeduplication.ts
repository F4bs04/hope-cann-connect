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

  const detectDuplicates = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate duplicate detection for now
      // TODO: Replace with actual function call once it's available in types
      const mockDuplicates: DuplicatePatient[] = [];
      
      setDuplicates(mockDuplicates);
      
      toast({
        title: "Detecção Executada",
        description: `Processo de detecção concluído. ${mockDuplicates.length} duplicatas encontradas.`,
      });
    } catch (error: any) {
      console.error('Erro ao detectar duplicatas:', error);
      toast({
        title: "Erro",
        description: "Erro ao detectar duplicatas de pacientes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const mergePatients = useCallback(async (mergeRequest: MergeRequest) => {
    setIsMerging(true);
    try {
      // TODO: Replace with actual function call once it's available in types
      // Simulate merge operation for now
      console.log('Merging patients:', mergeRequest);
      
      // Remove the merged patient from duplicates list
      setDuplicates(prev => prev.filter(
        dup => dup.patient_id !== mergeRequest.sourcePatientId
      ));
      
      toast({
        title: "Merge Simulado",
        description: "Operação de merge foi simulada com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao mesclar pacientes:', error);
      toast({
        title: "Erro no Merge",
        description: "Erro ao mesclar pacientes. Tente novamente.",
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