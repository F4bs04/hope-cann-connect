
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';

export interface ReceitaRecente {
  id: number;
  medicamento: string;
  data: string;
  status: string;
  posologia: string;
  id_paciente?: number;
  email_paciente?: string;
  data_validade?: string | null;
  observacoes?: string | null;
}

export function useReceitasRecentes() {
  const [receitas, setReceitas] = useState<ReceitaRecente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { userInfo, loading: userLoading } = useCurrentUserInfo();
  
  useEffect(() => {
    const fetchReceitas = async () => {
      try {
        // Wait for user info to load
        if (userLoading) return;
        
        // Check if we have a valid patient ID
        if (!userInfo.pacienteId) {
          console.error('No patient ID found for current user');
          setIsLoading(false);
          return;
        }

        // Fetch recipes for the current patient
        const { data, error } = await supabase
          .from('receitas_app')
          .select('id, medicamento, data, status, posologia, id_paciente, data_validade, observacoes')
          .eq('id_paciente', userInfo.pacienteId)
          .order('data', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        
        setReceitas(data || []);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        toast({
          title: "Erro ao carregar receitas",
          description: "Não foi possível carregar suas receitas.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReceitas();
  }, [toast, userInfo, userLoading]);

  return { receitas, isLoading };
}
