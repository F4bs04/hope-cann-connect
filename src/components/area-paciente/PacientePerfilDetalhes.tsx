
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Calendar, MapPin, Phone, ShieldCheck } from 'lucide-react';

interface Paciente {
  nome?: string;
  email?: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: string;
  telefone?: string;
  // fotoUrl?: string; // Adicionar se/quando disponível
}

interface PacientePerfilDetalhesProps {
  paciente: Paciente | null;
}

const InfoItem: React.FC<{ icon: React.ElementType, label: string, value?: string }> = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-hopecann-teal mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-gray-800">{value}</p>
      </div>
    </div>
  );
};

const PacientePerfilDetalhes: React.FC<PacientePerfilDetalhesProps> = ({ paciente }) => {
  if (!paciente) {
    return <p className="text-gray-600">Não foi possível carregar os dados do perfil.</p>;
  }

  const { nome, email, cpf, data_nascimento, endereco, telefone } = paciente;

  const formatarData = (data?: string) => {
    if (!data) return 'Não informado';
    try {
      // Verifica se a data já está no formato dd/mm/yyyy
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
        return data;
      }
      // Tenta converter se for um formato de data válido para o construtor Date
      const dataObj = new Date(data);
      // Adiciona verificação para data inválida que pode resultar de new Date('invalid string')
      if (isNaN(dataObj.getTime())) return 'Data inválida';
      // Ajuste para fuso horário local para evitar problemas com datas pulando um dia
      const offset = dataObj.getTimezoneOffset();
      const adjustedDate = new Date(dataObj.getTime() + offset * 60 * 1000);
      return adjustedDate.toLocaleDateString('pt-BR');
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return data; // Retorna a data original em caso de erro
    }
  };
  
  const formatarCPF = (cpf?: string) => {
    if (!cpf) return 'Não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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
    return tel; // Retorna original se não corresponder aos padrões comuns
  };


  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-hopecann-teal">Meu Perfil</h2>
      
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
          {/* Futuramente: <Button variant="outline" size="sm" className="mt-2">Editar Foto</Button> */}
        </div>
      </div>

      <div className="space-y-6">
        <InfoItem icon={ShieldCheck} label="CPF" value={formatarCPF(cpf)} />
        <InfoItem icon={Calendar} label="Data de Nascimento" value={formatarData(data_nascimento)} />
        <InfoItem icon={MapPin} label="Endereço" value={endereco || 'Não informado'} />
        <InfoItem icon={Phone} label="Telefone" value={formatarTelefone(telefone)} />
      </div>

      {/* Futuramente:
      <div className="mt-8 pt-6 border-t border-gray-200">
        <Button className="w-full sm:w-auto bg-hopecann-teal hover:bg-hopecann-teal/90">
          Editar Informações
        </Button>
      </div>
      */}
    </div>
  );
};

export default PacientePerfilDetalhes;
