
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ShieldCheck, Calendar, MapPin, Phone } from 'lucide-react';
import InfoItem from './InfoItem';
import { formatarCPF, formatarDataParaDisplay, formatTelefone } from '@/utils/formatters';
import { Paciente } from './Paciente.types';

interface PacienteInfoDisplayProps {
  paciente: Paciente;
}

const PacienteInfoDisplay: React.FC<PacienteInfoDisplayProps> = ({ paciente }) => {
  const { nome, email, cpf, data_nascimento, endereco, telefone, genero } = paciente;

  return (
    <>
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
        <InfoItem icon={Calendar} label="Data de Nascimento" value={formatarDataParaDisplay(data_nascimento)} />
        <InfoItem icon={MapPin} label="Endereço" value={endereco || 'Não informado'} />
        <InfoItem icon={Phone} label="Telefone" value={formatTelefone(telefone || '')} />
        {genero && <InfoItem icon={User} label="Gênero" value={genero} />}
      </div>
    </>
  );
};

export default PacienteInfoDisplay;
