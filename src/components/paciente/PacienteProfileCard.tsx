
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface PacienteProfileCardProps {
  nome: string;
  email: string;
  genero?: string;
  dataNascimento?: string;
  fotoUrl?: string;
}

const PacienteProfileCard: React.FC<PacienteProfileCardProps> = ({
  nome,
  email,
  genero,
  dataNascimento,
  fotoUrl,
}) => {
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-md mb-6 border border-gray-100 w-full max-w-md mx-auto animate-fade-in">
      <Avatar className="w-24 h-24 mb-3">
        {fotoUrl ? (
          <AvatarImage src={fotoUrl} alt={nome} />
        ) : (
          <AvatarFallback>
            <User className="w-12 h-12 text-hopecann-teal" />
          </AvatarFallback>
        )}
      </Avatar>
      <h2 className="text-2xl font-bold text-hopecann-teal mb-1">{nome}</h2>
      <p className="text-gray-600 mb-1">{email}</p>
      <div className="flex gap-4 text-gray-500 text-sm mt-1">
        {genero && <span>{genero}</span>}
        {dataNascimento && (
          <span>
            Nasc: {new Date(dataNascimento).toLocaleDateString("pt-BR")}
          </span>
        )}
      </div>
    </div>
  );
};

export default PacienteProfileCard;
