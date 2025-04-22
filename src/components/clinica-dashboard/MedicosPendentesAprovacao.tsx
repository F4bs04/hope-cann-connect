
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

interface MedicoPendente {
  id: number;
  nome: string;
  especialidade: string;
  crm: string;
  foto_perfil?: string | null;
  cpf: string;
  telefone: string;
  biografia: string | null;
}

export const MedicosPendentesAprovacao: React.FC = () => {
  const [medicosPendentes, setMedicosPendentes] = useState<MedicoPendente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendentes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('medicos')
      .select('*')
      .eq('aprovado', false);

    if (error) {
      toast({
        title: "Erro ao buscar médicos pendentes",
        variant: "destructive",
        description: error.message,
      });
      setMedicosPendentes([]);
      setLoading(false);
      return;
    }
    setMedicosPendentes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPendentes();
  }, []);

  // Aprovar médico
  const handleAprovar = async (medicoId: number) => {
    const { error } = await supabase
      .from("medicos")
      .update({ aprovado: true, data_aprovacao: new Date().toISOString() })
      .eq("id", medicoId);

    if (error) {
      toast({
        title: "Erro ao aprovar médico",
        variant: "destructive",
        description: error.message,
      });
    } else {
      toast({
        title: "Médico aprovado",
        description: "Esse médico pode agora aparecer no sistema.",
      });
      setMedicosPendentes(medicosPendentes.filter(m => m.id !== medicoId));
    }
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-[#00B3B0]" />
            Aguardando aprovação...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-16 flex items-center text-gray-500">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (medicosPendentes.length === 0) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2 text-[#00B3B0]" />
          Médicos pendentes de aprovação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {medicosPendentes.map((medico) => (
            <div key={medico.id} className="flex items-center gap-4 px-2 py-3 bg-[#FAFAFC] border border-[#E5DEFF] rounded-lg">
              <img 
                src={medico.foto_perfil || "/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png"} 
                className="h-14 w-14 rounded-full border-2 border-[#E5DEFF] object-cover shadow"
                alt={medico.nome}
              />
              <div className="flex-1">
                <div className="font-bold">{medico.nome}</div>
                <div className="text-sm text-[#7E69AB]">{medico.especialidade}</div>
                <div className="text-xs text-gray-500">CRM: {medico.crm} | CPF: {medico.cpf}</div>
                <div className="text-xs text-gray-500">Telefone: {medico.telefone}</div>
                {medico.biografia && (
                  <div className="text-xs text-gray-600 mt-1">
                    {medico.biografia}
                  </div>
                )}
              </div>
              <Button
                onClick={() => handleAprovar(medico.id)}
                className="bg-green-500 hover:bg-green-600"
              >
                Aprovar
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicosPendentesAprovacao;
