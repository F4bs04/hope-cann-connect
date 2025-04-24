
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

export const usePacienteAuth = () => {
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        
        if (!userEmail) {
          toast({
            title: "Acesso não autorizado",
            description: "Faça login para acessar a área do paciente.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }
        
        // First check if the user exists in usuarios table
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle();
          
        if (userError) {
          console.error("Error fetching user data:", userError);
          throw new Error("Erro ao verificar usuário");
        }
        
        if (!userData) {
          console.error("User not found in usuarios table");
          throw new Error("Usuário não encontrado");
        }
        
        // Then check if there's a matching paciente record
        const { data: pacienteData, error: pacienteError } = await supabase
          .from('pacientes')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle();
        
        if (pacienteError && pacienteError.code !== 'PGRST116') {
          console.error("Error fetching patient data:", pacienteError);
          throw new Error("Erro ao verificar paciente");
        }
        
        if (pacienteData) {
          setPaciente(pacienteData);
        } else {
          // If no patient record exists, try to create one
          // based on the user information we have
          const newPaciente = {
            id_usuario: userData.id,
            email: userEmail,
            nome: userData.tipo_usuario === 'paciente' ? 'Novo Paciente' : 'Usuário',
            cpf: "",
            data_nascimento: new Date().toISOString().split('T')[0],
            telefone: "",
            endereco: ""
          };
          
          const { data: insertedPaciente, error: insertError } = await supabase
            .from('pacientes')
            .insert([newPaciente])
            .select()
            .single();
            
          if (insertError) {
            console.error("Error creating patient record:", insertError);
            toast({
              title: "Perfil incompleto",
              description: "Por favor, complete seu perfil de paciente.",
              variant: "destructive"
            });
            // Even with error, allow access but set paciente as minimal data
            setPaciente({ ...newPaciente, id: null });
          } else {
            setPaciente(insertedPaciente);
          }
        }
      } catch (error: any) {
        console.error('Authentication error:', error);
        toast({
          title: "Erro de autenticação",
          description: error.message || "Ocorreu um erro ao verificar suas credenciais. Por favor, faça login novamente.",
          variant: "destructive"
        });
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  return { paciente, loading };
};
