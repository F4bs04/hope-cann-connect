
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Paciente } from '@/components/area-paciente/perfil/Paciente.types';

interface UsePacienteAccountDeletionProps {
  paciente: Paciente | null;
}

export const usePacienteAccountDeletion = ({ paciente }: UsePacienteAccountDeletionProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const deleteAccount = async () => {
    if (!paciente?.id) {
      toast({ title: "Erro", description: "ID do paciente não encontrado para exclusão.", variant: "destructive" });
      return;
    }

    try {
      // Excluir dados do paciente primeiro
      const { error: pacienteError } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', paciente.id);

      if (pacienteError) {
        console.error("Erro ao deletar paciente:", pacienteError);
        throw new Error(`Falha ao deletar dados do paciente: ${pacienteError.message}`);
      }

      // Não tentamos mais excluir o registro do usuário diretamente
      // Isso era o que causava o erro de permissão

      // Sair da sessão autenticada do Supabase
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error("Erro ao fazer signOut:", signOutError);
        toast({ title: "Erro no Logout", description: "Houve um problema ao encerrar sua sessão no servidor, mas seus dados locais serão limpos.", variant: "destructive" });
      }

      // Limpar localStorage independentemente do status de signOut do Supabase
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      localStorage.removeItem('authTimestamp');
      
      toast({ title: "Dados Excluídos", description: "Seus dados de paciente foram excluídos com sucesso. Você será redirecionado." });
      
      navigate('/login');

    } catch (error: any) {
      console.error("Erro ao excluir conta:", error);
      toast({ title: "Erro ao Excluir Dados", description: error.message || "Não foi possível excluir seus dados.", variant: "destructive" });
    }
  };

  return { deleteAccount };
};
