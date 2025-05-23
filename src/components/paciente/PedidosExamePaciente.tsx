
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PedidosExamePacienteProps {
  pacienteId: number;
}

interface PedidoExame {
  id: number;
  nome_exame: string;
  data_solicitacao: string;
  status: string;
  prioridade: string;
  justificativa: string;
}

const PedidosExamePaciente: React.FC<PedidosExamePacienteProps> = ({ pacienteId }) => {
  const [pedidos, setPedidos] = useState<PedidoExame[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (pacienteId <= 0) {
      setLoading(false);
      return;
    }
    
    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pedidos_exame')
          .select('*')
          .eq('id_paciente', pacienteId)
          .order('data_solicitacao', { ascending: false });
        
        if (error) throw error;
        
        setPedidos(data || []);
      } catch (error) {
        console.error("Erro ao buscar pedidos de exame:", error);
        toast({
          title: "Erro ao buscar pedidos de exame",
          description: "Não foi possível carregar seus pedidos de exame. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPedidos();
  }, [pacienteId, toast]);

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Seus Pedidos de Exame</h2>
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-hopecann-teal" />
        </div>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Seus Pedidos de Exame</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum pedido de exame encontrado</h3>
            <p className="text-gray-500">
              Você ainda não possui pedidos de exame registrados no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return <Badge className="bg-red-100 text-red-800">Urgente</Badge>;
      case 'alta':
        return <Badge className="bg-orange-100 text-orange-800">Alta</Badge>;
      case 'média':
        return <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Rotina</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'realizado':
        return <Badge className="bg-green-100 text-green-800">Realizado</Badge>;
      case 'em_andamento':
        return <Badge className="bg-purple-100 text-purple-800">Em andamento</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Seus Pedidos de Exame</h2>
      
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exame</TableHead>
                <TableHead>Data da Solicitação</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell className="font-medium">{pedido.nome_exame}</TableCell>
                  <TableCell>
                    {format(new Date(pedido.data_solicitacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>{getPrioridadeBadge(pedido.prioridade)}</TableCell>
                  <TableCell>{getStatusBadge(pedido.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PedidosExamePaciente;
