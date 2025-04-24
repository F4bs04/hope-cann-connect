
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  
  useEffect(() => {
    const fetchReceitas = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('receitas_app')
          .select('id, medicamento, data, status, posologia, id_paciente, email_paciente, data_validade, observacoes')
          .eq('email_paciente', userEmail)
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
  }, [toast]);

  return { receitas, isLoading };
}
