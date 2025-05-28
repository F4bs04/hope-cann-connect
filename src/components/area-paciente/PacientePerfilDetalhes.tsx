import React, { useState } from 'react';
import { Edit3, User as UserIconLucide } from 'lucide-react'; // Renamed User to avoid conflict if Paciente.types.ts is not created/imported
import PacienteForm from '@/components/forms/PacienteForm';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Import the new components
import PacienteInfoDisplay from './perfil/PacienteInfoDisplay';
import DeleteAccountSection from './perfil/DeleteAccountSection';
import { Paciente } from './perfil/Paciente.types'; // Import shared Paciente type

// Paciente interface is now imported from Paciente.types.ts

interface PacientePerfilDetalhesProps {
  paciente: Paciente | null;
  onUpdatePaciente: (updatedPaciente: Paciente) => void;
}

// Removed local InfoItem component

const PacientePerfilDetalhes: React.FC<PacientePerfilDetalhesProps> = ({ paciente, onUpdatePaciente }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!paciente) {
    return <p className="text-gray-600">Não foi possível carregar os dados do perfil.</p>;
  }

  const handleFormSubmit = async (data: any) => {
    if (!paciente?.id) {
        toast({ title: "Erro", description: "ID do paciente não encontrado.", variant: "destructive" });
        return;
    }

    // Keep date formatting logic for submission as it's specific to how the form data might arrive
    let formattedDataNascimento = data.data_nascimento;
    if (data.data_nascimento && /^\d{2}\/\d{2}\/\d{4}$/.test(data.data_nascimento)) {
        const parts = data.data_nascimento.split('/');
        formattedDataNascimento = `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else if (data.data_nascimento && new Date(data.data_nascimento) instanceof Date && !isNaN(new Date(data.data_nascimento).valueOf())) {
        // Ensure conversion to yyyy-MM-dd if it's a different valid date string or object
        const dateObj = new Date(data.data_nascimento);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        formattedDataNascimento = `${year}-${month}-${day}`;
    }

    const { error } = await supabase
      .from('pacientes')
      .update({
        nome: data.nome,
        telefone: data.telefone,
        data_nascimento: formattedDataNascimento, // Use the consistently formatted date
        endereco: data.endereco,
        genero: data.genero,
      })
      .eq('id', paciente.id);

    if (error) {
      console.error("Erro ao atualizar perfil do paciente:", error);
      toast({ title: "Erro ao atualizar", description: `Permissão negada ou outro erro: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Perfil atualizado com sucesso!" });
      onUpdatePaciente({ 
        ...paciente, 
        ...data, 
        data_nascimento: formattedDataNascimento // Ensure state update uses consistent yyyy-MM-dd
      });
      setIsEditing(false);
    }
  };

  const handleDeleteAccount = async () => {
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
          toast({ title: "Atenção", description: `Dados do paciente foram removidos, mas houve um problema ao remover o registro de usuário: ${usuarioError.message}.`, variant: "destructive" });
        }
      } else {
        toast({ title: "Atenção", description: "ID de usuário não encontrado para remoção completa. Apenas dados do paciente foram removidos.", variant: "destructive" });
      }
      
      await supabase.auth.signOut();

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

  if (isEditing) {
    return (
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-hopecann-teal">Editar Perfil</h2>
        <PacienteForm
          initialData={{
            ...paciente,
            // PacienteForm expects data_nascimento in yyyy-MM-dd for the date input
            // If paciente.data_nascimento is already yyyy-MM-dd, no change needed
            // If it's dd/MM/yyyy (less likely here after updates), it would need conversion
            // Assuming paciente.data_nascimento is consistently yyyy-MM-dd in the state
            data_nascimento: paciente.data_nascimento 
          }}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-hopecann-teal">Meu Perfil</h2>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
          <Edit3 className="h-4 w-4" />
          Editar
        </Button>
      </div>
      
      <PacienteInfoDisplay paciente={paciente} />

      <DeleteAccountSection onDeleteAccount={handleDeleteAccount} />
    </div>
  );
};

export default PacientePerfilDetalhes;
