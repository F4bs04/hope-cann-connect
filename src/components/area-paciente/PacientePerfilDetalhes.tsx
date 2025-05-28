import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Calendar, MapPin, Phone, ShieldCheck, Edit3, Trash2 } from 'lucide-react';
import PacienteForm from '@/components/forms/PacienteForm';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';

interface Paciente {
  id: number; // Adicionado id para update
  id_usuario?: number; // Adicionado para poder deletar o registro em 'usuarios'
  nome?: string;
  email?: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: string;
  telefone?: string;
  genero?: string; // Adicionar se/quando disponível no PacienteForm
  // fotoUrl?: string; 
}

interface PacientePerfilDetalhesProps {
  paciente: Paciente | null;
  onUpdatePaciente: (updatedPaciente: Paciente) => void; // Callback para atualizar no componente pai
}

const InfoItem: React.FC<{ icon: React.ElementType, label: string, value?: string }> = ({ icon: Icon, label, value }) => {
  if (!value && value !== '') return null; // Permite exibir string vazia se explicitamente passada
  return (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-hopecann-teal mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-gray-800">{value || 'Não informado'}</p>
      </div>
    </div>
  );
};

const PacientePerfilDetalhes: React.FC<PacientePerfilDetalhesProps> = ({ paciente, onUpdatePaciente }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!paciente) {
    return <p className="text-gray-600">Não foi possível carregar os dados do perfil.</p>;
  }

  const { nome, email, cpf, data_nascimento, endereco, telefone } = paciente;

  const formatarData = (data?: string) => {
    if (!data) return 'Não informado';
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(data)) { // Checa se já está yyyy-MM-dd
        const [year, month, day] = data.split('-');
        return `${day}/${month}/${year}`;
      }
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
        return data;
      }
      const dataObj = new Date(data);
      if (isNaN(dataObj.getTime())) return 'Data inválida';
      const offset = dataObj.getTimezoneOffset();
      const adjustedDate = new Date(dataObj.getTime() + offset * 60 * 1000);
      return adjustedDate.toLocaleDateString('pt-BR');
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return data;
    }
  };
  
  const formatarCPF = (cpfValue?: string) => {
    if (!cpfValue) return 'Não informado';
    return cpfValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatarTelefone = (tel?: string) => {
    if (!tel) return 'Não informado';
    const cleaned = tel.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return tel;
  };

  const handleFormSubmit = async (data: any) => {
    if (!paciente?.id) {
        toast({ title: "Erro", description: "ID do paciente não encontrado.", variant: "destructive" });
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

    const { error } = await supabase
      .from('pacientes')
      .update({
        nome: data.nome,
        telefone: data.telefone,
        data_nascimento: formattedDataNascimento,
        endereco: data.endereco,
        genero: data.genero,
      })
      .eq('id', paciente.id);

    if (error) {
      console.error("Erro ao atualizar perfil do paciente:", error); // Log detalhado do erro
      toast({ title: "Erro ao atualizar", description: `Permissão negada ou outro erro: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Perfil atualizado com sucesso!" });
      onUpdatePaciente({ 
        ...paciente, 
        ...data, 
        data_nascimento: formattedDataNascimento // garantir que a data atualizada no estado também está no formato correto para exibição/próxima edição
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
      // 1. Deletar da tabela 'pacientes'
      const { error: pacienteError } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', paciente.id);

      if (pacienteError) {
        console.error("Erro ao deletar paciente:", pacienteError);
        throw new Error(`Falha ao deletar dados do paciente: ${pacienteError.message}`);
      }

      // 2. Deletar da tabela 'usuarios' (se id_usuario existir)
      if (paciente.id_usuario) {
        const { error: usuarioError } = await supabase
          .from('usuarios')
          .delete()
          .eq('id', paciente.id_usuario);

        if (usuarioError) {
          console.error("Erro ao deletar usuário:", usuarioError);
          // Pode ser um erro parcial, mas o paciente já foi deletado. Continuar com logout.
          toast({ title: "Atenção", description: `Dados do paciente foram removidos, mas houve um problema ao remover o registro de usuário: ${usuarioError.message}.`, variant: "warning" });
        }
      } else {
        toast({ title: "Atenção", description: "ID de usuário não encontrado para remoção completa. Apenas dados do paciente foram removidos.", variant: "warning" });
      }
      
      // 3. Logout
      await supabase.auth.signOut();

      // 4. Limpar localStorage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      localStorage.removeItem('authTimestamp');
      
      toast({ title: "Conta Excluída", description: "Sua conta foi excluída com sucesso. Você será redirecionado." });
      
      // 5. Redirecionar para login
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
          initialData={paciente}
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
      
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8 pb-8 border-b border-gray-200">
        <Avatar className="w-24 h-24 sm:w-32 sm:h-32 text-hopecann-teal">
          {/* <AvatarImage src={paciente.fotoUrl} alt={nome} /> */}
          <AvatarFallback className="bg-hopecann-teal/10">
            <User className="w-12 h-12 sm:w-16 sm:h-16" />
          </AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">{nome || 'Nome não informado'}</h3>
          <p className="text-gray-600">{email || 'Email não informado'}</p>
        </div>
      </div>

      <div className="space-y-6">
        <InfoItem icon={ShieldCheck} label="CPF" value={formatarCPF(cpf)} />
        <InfoItem icon={Calendar} label="Data de Nascimento" value={formatarData(data_nascimento)} />
        <InfoItem icon={MapPin} label="Endereço" value={endereco || 'Não informado'} />
        <InfoItem icon={Phone} label="Telefone" value={formatarTelefone(telefone)} />
        {paciente.genero && <InfoItem icon={User} label="Gênero" value={paciente.genero} />}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-auto flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Excluir Conta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão de Conta</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação é irreversível. Todos os seus dados associados à sua conta de paciente e usuário serão permanentemente excluídos. 
                Você tem certeza que deseja excluir sua conta?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                Sim, Excluir Conta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className="mt-2 text-xs text-gray-500 text-center sm:text-left">
          A exclusão da conta removerá seus dados das tabelas principais da aplicação. A remoção completa do sistema de autenticação pode requerer processamento adicional.
        </p>
      </div>
    </div>
  );
};

export default PacientePerfilDetalhes;
