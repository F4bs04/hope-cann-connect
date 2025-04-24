
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
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;
      
      try {
        const { data, error } = await supabase
          .from('receitas_app')
          .select('*')
          .eq('email_paciente', userEmail)
          .order('data', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        
        if (data) {
          // Transform the raw data to match our ReceitaRecente interface
          const typedReceitas: ReceitaRecente[] = data.map(item => ({
            id: item.id,
            medicamento: item.medicamento,
            data: item.data,
            status: item.status,
            posologia: item.posologia,
            id_paciente: item.id_paciente,
            // Only include email_paciente if it exists in the item
            ...(item.email_paciente !== undefined && { email_paciente: item.email_paciente }),
            data_validade: item.data_validade,
            observacoes: item.observacoes
          }));
          
          setReceitas(typedReceitas);
        }
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
