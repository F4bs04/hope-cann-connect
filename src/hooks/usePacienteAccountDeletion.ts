
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
      const { error: pacienteError } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', paciente.id);

      if (pacienteError) {
        console.error("Erro ao deletar paciente:", pacienteError);
        throw new Error(`Falha ao deletar dados do paciente: ${pacienteError.message}`);
      }

      if (paciente.id_usuario) {
        const { error: usuarioError } = await supabase
          .from('usuarios')
          .delete()
          .eq('id', paciente.id_usuario);

        if (usuarioError) {
          console.error("Erro ao deletar usuário:", usuarioError);
          // Toasting an error, but proceeding with logout and navigation as patient data is deleted.
           toast({ title: "Atenção", description: `Dados do paciente foram removidos, mas houve um problema ao remover o registro de usuário: ${usuarioError.message}. Contacte o suporte.`, variant: "destructive" });
        }
      } else {
         toast({ title: "Atenção", description: "ID de usuário não encontrado para remoção completa do login. Apenas dados do perfil foram removidos.", variant: "destructive" });
      }
      
      // Attempt to sign out the user from Supabase auth
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error("Erro ao fazer signOut:", signOutError);
        // Toast this error but still proceed with local cleanup and navigation
        toast({ title: "Erro no Logout", description: "Houve um problema ao encerrar sua sessão no servidor, mas seus dados locais serão limpos.", variant: "destructive" });
      }

      // Clear local storage regardless of Supabase signOut status
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      localStorage.removeItem('authTimestamp');
      
      toast({ title: "Conta Excluída", description: "Sua conta foi excluída com sucesso. Você será redirecionado." });
      
      navigate('/login');

    } catch (error: any) {
      console.error("Erro ao excluir conta:", error);
      toast({ title: "Erro ao Excluir Conta", description: error.message || "Não foi possível excluir sua conta.", variant: "destructive" });
    }
  };

  return { deleteAccount };
};
