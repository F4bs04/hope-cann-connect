import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface MedicoPendente {
  id: string;
  nome: string;
  especialidade: string;
  crm: string;
  cpf: string;
  telefone: string;
  data_cadastro: string;
}

export const MedicosPendentesAprovacao: React.FC = () => {
  const [medicosPendentes, setMedicosPendentes] = useState<MedicoPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPendentes = async () => {
    setLoading(true);
    try {
      // Buscar médicos não aprovados do Supabase
      const { data: medicosData, error } = await supabase
        .from('doctors')
        .select(`
          id,
          crm,
          cpf,
          specialty,
          created_at,
          profiles!inner(
            full_name,
            email,
            phone
          )
        `)
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar médicos pendentes:', error);
        setMedicosPendentes([]);
        return;
      }

      // Mapear dados para o formato esperado
      const medicosPendentes: MedicoPendente[] = medicosData?.map(medico => ({
        id: medico.id,
        nome: medico.profiles?.full_name || 'Nome não informado',
        especialidade: medico.specialty || 'Especialidade não informada',
        crm: medico.crm || 'CRM não informado',
        cpf: medico.cpf || 'CPF não informado',
        telefone: medico.profiles?.phone || 'Telefone não informado',
        data_cadastro: medico.created_at
      })) || [];

      setMedicosPendentes(medicosPendentes);
    } catch (error) {
      console.error('Erro ao buscar médicos pendentes:', error);
      setMedicosPendentes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendentes();
  }, []);

  // Aprovar médico
  const handleAprovar = async (medicoId: string) => {
    try {
      // Atualizar status no Supabase
      const { error } = await supabase
        .from('doctors')
        .update({ 
          is_approved: true,
          approved_at: new Date().toISOString()
        })
        .eq('id', medicoId);

      if (error) {
        throw error;
      }

      toast({
        title: "Médico aprovado",
        description: "O médico foi aprovado com sucesso!",
      });
      
      // Remove da lista de pendentes
      setMedicosPendentes(prev => prev.filter(m => m.id !== medicoId));
    } catch (error) {
      console.error('Erro ao aprovar médico:', error);
      toast({
        title: "Erro ao aprovar médico",
        variant: "destructive",
        description: "Ocorreu um erro ao tentar aprovar o médico.",
      });
    }
  };

  // Rejeitar médico
  const handleRejeitar = async (medicoId: string) => {
    try {
      // Atualizar status no Supabase (marcar como não disponível)
      const { error } = await supabase
        .from('doctors')
        .update({ 
          is_available: false,
          is_approved: false
        })
        .eq('id', medicoId);

      if (error) {
        throw error;
      }

      toast({
        title: "Médico rejeitado",
        description: "O médico foi rejeitado.",
        variant: "destructive",
      });
      
      // Remove da lista de pendentes
      setMedicosPendentes(prev => prev.filter(m => m.id !== medicoId));
    } catch (error) {
      console.error('Erro ao rejeitar médico:', error);
      toast({
        title: "Erro ao rejeitar médico",
        variant: "destructive",
        description: "Ocorreu um erro ao tentar rejeitar o médico.",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Médicos Pendentes de Aprovação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <p>Carregando médicos pendentes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Médicos Pendentes de Aprovação
          {medicosPendentes.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {medicosPendentes.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {medicosPendentes.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-500">Não há médicos pendentes de aprovação</p>
          </div>
        ) : (
          <div className="space-y-4">
            {medicosPendentes.map((medico) => (
              <div key={medico.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{medico.nome}</h3>
                    <p className="text-sm text-gray-600">{medico.especialidade}</p>
                    <p className="text-sm text-gray-500">CRM: {medico.crm}</p>
                  </div>
                  <Badge variant="outline">Pendente</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">CPF:</span> {medico.cpf}
                  </div>
                  <div>
                    <span className="font-medium">Telefone:</span> {medico.telefone}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleAprovar(medico.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleRejeitar(medico.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};