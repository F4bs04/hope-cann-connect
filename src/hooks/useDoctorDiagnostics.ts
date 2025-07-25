
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface DiagnosticResult {
  success: boolean;
  message: string;
  userDoctors?: any[];
  allDoctors?: any[];
}

/**
 * Hook for diagnosing doctor data in the database
 */
export const useDoctorDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult>({
    success: true,
    message: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const diagnoseDatabase = async () => {
      try {
        // 1. Verificando usuários do tipo médico na tabela 'profiles'
        const { data: userDoctors, error: userDoctorsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'doctor');
        
        if (userDoctorsError) {
          console.error('Error fetching doctor users:', userDoctorsError);
          setDiagnostics({
            success: false,
            message: `Erro ao consultar usuários médicos: ${userDoctorsError.message}`
          });
          return;
        }
        
        console.log(`Total de usuários médicos no banco: ${userDoctors?.length || 0}`);
        if (userDoctors && userDoctors.length > 0) {
          console.log("Usuários médicos encontrados:", userDoctors);
        } else {
          console.log("Nenhum usuário médico encontrado na tabela");
        }
        
        // 2. Verificando todos os médicos na tabela 'doctors' para diagnóstico
        const { data: allDoctors, error: allDoctorsError } = await supabase
          .from('doctors')
          .select('*');
        
        if (allDoctorsError) {
          console.error('Error fetching all doctors:', allDoctorsError);
          setDiagnostics({
            success: false,
            message: `Erro ao consultar todos os médicos: ${allDoctorsError.message}`,
            userDoctors
          });
          return;
        }
        
        console.log(`Total de médicos no banco: ${allDoctors?.length || 0}`);
        if (allDoctors && allDoctors.length > 0) {
          console.log("Médicos encontrados (todos):", allDoctors);
        } else {
          console.log("Nenhum médico encontrado na tabela");
          setDiagnostics({
            success: false,
            message: 'Nenhum médico encontrado na tabela',
            userDoctors,
            allDoctors: []
          });
          return;
        }
        
        setDiagnostics({
          success: true,
          message: `${allDoctors.length} médicos encontrados no banco`,
          userDoctors,
          allDoctors
        });
        
      } catch (error) {
        console.error('Error during database diagnosis:', error);
        setDiagnostics({
          success: false,
          message: `Erro durante diagnóstico do banco: ${error}`
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    diagnoseDatabase();
  }, []);
  
  return { diagnostics, isLoading };
};
