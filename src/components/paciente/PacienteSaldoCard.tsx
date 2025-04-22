
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getSaldoPacienteById } from "@/services/supabaseService";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";

interface PacienteSaldoCardProps {
  pacienteId: number;
  className?: string;
}

const PacienteSaldoCard: React.FC<PacienteSaldoCardProps> = ({ pacienteId, className }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["saldo-paciente", pacienteId],
    queryFn: () => getSaldoPacienteById(pacienteId),
    enabled: !!pacienteId,
  });

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Wallet className="w-5 h-5 text-hopecann-teal" />
      <span className="font-medium text-gray-700">Saldo:</span>
      <Badge className="bg-hopecann-teal/90 text-white px-3 py-1 text-md">
        {isLoading && "Carregando..."}
        {error && "Erro"}
        {data && (
          <>R$ {Number(data.saldo_total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
        )}
      </Badge>
    </div>
  );
};

export default PacienteSaldoCard;
