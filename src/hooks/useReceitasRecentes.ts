import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserInfo } from './useCurrentUserInfo';

export interface ReceitaRecente {
  id: number;
  medicamento: string;
  data: string;
  medico_nome?: string; 
}

export const useReceitasRecentes = () => {
  const { toast } = useToast();
  const [receitas, setReceitas] = useState<ReceitaRecente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Call useCurrentUserInfo at the top level of the hook
  const { userInfo, loading: userLoading, error: userError } = useCurrentUserInfo();

  useEffect(() => {
    // Define an async function to fetch recipes
    const fetchReceitas = async (pacienteId: number) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('receitas_app')
          .select(`
            id,
            medicamento,
            data,
            consultas (
              medicos ( nome )
            )
          `)
          .eq('id_paciente', pacienteId)
          .order('data', { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching recent prescriptions:", error);
          toast({
            title: 'Erro ao carregar receitas',
            description: error.message,
            variant: 'destructive',
          });
          setReceitas([]);
        } else if (data) {
          const formattedReceitas = data.map((r: any) => ({
            id: r.id,
            medicamento: r.medicamento,
            data: r.data,
            // @ts-ignore TODO: Type supabase response properly
            medico_nome: r.consultas?.medicos?.nome || 'Não informado',
          }));
          setReceitas(formattedReceitas);
        }
      } catch (e: any) {
        console.error("Catch block error fetching recent prescriptions:", e);
        toast({
          title: 'Erro ao carregar receitas',
          description: 'Ocorreu um erro inesperado.',
          variant: 'destructive',
        });
        setReceitas([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only proceed if user info is loaded and there's no error
    if (!userLoading) {
      if (userError || !userInfo.pacienteId) {
        // Log the issue but don't necessarily toast here if useCurrentUserInfo already handles it
        // or if the component rendering this data will show a message.
        // However, a console error is good for debugging.
        console.error(
          "useReceitasRecentes: Cannot fetch recipes. User error or no patient ID.",
          { userError, pacienteId: userInfo.pacienteId }
        );
        // If userInfo.pacienteId is null/0, it means no valid patient.
        // We shouldn't toast an error for *this* hook, as it's expected behavior if there's no patient.
        // The UI should reflect "no recipes" or "patient data not found".
        // Setting loading to false and recipes to empty is appropriate.
        setReceitas([]);
        setIsLoading(false);
      } else {
        // Valid patientId, proceed to fetch recipes
        fetchReceitas(userInfo.pacienteId);
      }
    } else {
      // User info is still loading, keep setIsLoading(true) or manage as needed
      setIsLoading(true);
    }

  // Dependencies:
  // - userInfo.pacienteId: to refetch if the patient ID changes
  // - userLoading: to trigger when user info is loaded
  // - userError: to react to errors from useCurrentUserInfo
  // - toast: as it's used inside the effect
  }, [userInfo.pacienteId, userLoading, userError, toast]); // Added userInfo.pacienteId

  return { receitas, isLoading };
};
