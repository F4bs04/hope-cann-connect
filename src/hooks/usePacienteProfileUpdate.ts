
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Paciente } from '@/components/area-paciente/perfil/Paciente.types';

interface UsePacienteProfileUpdateProps {
  pacienteId: number | undefined;
  onUpdatePaciente: (updatedPacienteData: Paciente) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const usePacienteProfileUpdate = ({ 
  pacienteId, 
  onUpdatePaciente,
  setIsEditing 
}: UsePacienteProfileUpdateProps) => {
  const { toast } = useToast();

  const submitProfileUpdate = async (data: any, currentPacienteData: Paciente | null) => {
    if (!pacienteId) {
      toast({ title: "Erro", description: "ID do paciente não encontrado.", variant: "destructive" });
      return;
    }
    if (!currentPacienteData) {
      toast({ title: "Erro", description: "Dados atuais do paciente não encontrados.", variant: "destructive" });
      return;
    }

    let formattedDataNascimento = data.data_nascimento;
    if (data.data_nascimento && /^\d{2}\/\d{2}\/\d{4}$/.test(data.data_nascimento)) {
      const parts = data.data_nascimento.split('/');
      formattedDataNascimento = `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else if (data.data_nascimento && new Date(data.data_nascimento) instanceof Date && !isNaN(new Date(data.data_nascimento).valueOf())) {
      const dateObj = new Date(data.data_nascimento);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      formattedDataNascimento = `${year}-${month}-${day}`;
    }

    const updatePayload = {
      nome: data.nome,
      telefone: data.telefone,
      data_nascimento: formattedDataNascimento,
      endereco: data.endereco,
      genero: data.genero,
    };

    const { error } = await supabase
      .from('pacientes')
      .update(updatePayload)
      .eq('id', pacienteId);

    if (error) {
      console.error("Erro ao atualizar perfil do paciente:", error);
      toast({ title: "Erro ao atualizar", description: `Permissão negada ou outro erro: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Perfil atualizado com sucesso!" });
      onUpdatePaciente({
        ...currentPacienteData,
        ...updatePayload, // Use the payload that was sent to Supabase
        data_nascimento: formattedDataNascimento // Ensure state update uses consistent yyyy-MM-dd
      });
      setIsEditing(false);
    }
  };

  return { submitProfileUpdate };
};
