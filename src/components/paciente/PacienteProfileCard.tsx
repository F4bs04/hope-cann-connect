
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleDashboardNavigation = () => {
    navigate('/area-paciente-v2');
  };

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
      <Button 
        onClick={handleDashboardNavigation} 
        className="mt-4 w-full bg-hopecann-teal hover:bg-hopecann-teal/90"
      >
        <Layout className="mr-2 h-4 w-4" />
        Ver Dashboard V2
      </Button>
    </div>
  );
};

export default PacienteProfileCard;
