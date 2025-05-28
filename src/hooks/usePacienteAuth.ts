
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
        // Verificar primeiro a sessão do Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        // Verificar o localStorage para autenticação baseada em localStorage
        const userEmail = localStorage.getItem('userEmail');
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        if (!session && !isAuthenticated) {
          throw new Error("Usuário não autenticado");
        }
        
        // Usar o email da sessão do Supabase ou do localStorage
        const email = session?.user?.email || userEmail;
        
        if (!email) {
          throw new Error("Email não encontrado");
        }
        
        // Buscar dados do paciente
        const { data: pacienteData, error: pacienteError } = await supabase
          .from('pacientes')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        
        if (pacienteError && pacienteError.code !== 'PGRST116') { // PGRST116 significa que nenhuma linha foi encontrada
          console.error("Erro ao buscar dados do paciente:", pacienteError);
          throw new Error("Erro ao verificar paciente");
        }
        
        if (pacienteData) {
          // Se encontrou o paciente, define os dados
          setPaciente(pacienteData);
        } else {
          // Se não encontrou o paciente, verifica se há um usuário correspondente
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .maybeSingle();
            
          if (userError) {
            console.error("Erro ao buscar dados do usuário:", userError);
            throw new Error("Erro ao verificar usuário");
          }
          
          if (!userData) {
            console.error("Usuário não encontrado:", email);
            throw new Error("Usuário não encontrado");
          }
          
          // Tenta criar um perfil de paciente básico se o usuário existe
          const newPaciente = {
            id_usuario: userData.id,
            email: email,
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
            console.error("Erro ao criar registro de paciente:", insertError);
            toast({
              title: "Perfil incompleto",
              description: "Por favor, complete seu perfil de paciente.",
              variant: "destructive"
            });
            // Mesmo com erro, permite acesso mas define paciente com dados mínimos
            setPaciente({ ...newPaciente, id: null });
          } else {
            setPaciente(insertedPaciente);
          }
        }
      } catch (error: any) {
        console.error('Erro de autenticação:', error);
        toast({
          title: "Erro de autenticação",
          description: error.message || "Ocorreu um erro ao verificar suas credenciais. Por favor, faça login novamente.",
          variant: "destructive"
        });
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        localStorage.removeItem('authTimestamp');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  return { paciente, loading };
};
