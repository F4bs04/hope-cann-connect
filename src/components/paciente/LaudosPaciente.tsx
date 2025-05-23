
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface LaudosPacienteProps {
  pacienteId: number;
}

interface Laudo {
  id: number;
  tipo_laudo: string;
  descricao: string;
  data_emissao: string;
  assinado: boolean;
}

const LaudosPaciente: React.FC<LaudosPacienteProps> = ({ pacienteId }) => {
  const [laudos, setLaudos] = useState<Laudo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (pacienteId <= 0) {
      setLoading(false);
      return;
    }
    
    const fetchLaudos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('laudos')
          .select('*')
          .eq('id_paciente', pacienteId)
          .order('data_emissao', { ascending: false });
        
        if (error) throw error;
        
        setLaudos(data || []);
      } catch (error) {
        console.error("Erro ao buscar laudos:", error);
        toast({
          title: "Erro ao buscar laudos",
          description: "Não foi possível carregar seus laudos. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLaudos();
  }, [pacienteId, toast]);

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Seus Laudos</h2>
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-hopecann-teal" />
        </div>
      </div>
    );
  }

  if (laudos.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Seus Laudos</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum laudo encontrado</h3>
            <p className="text-gray-500">
              Você ainda não possui laudos registrados no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Seus Laudos</h2>
      
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laudos.map((laudo) => (
                <TableRow key={laudo.id}>
                  <TableCell className="font-medium">{laudo.tipo_laudo}</TableCell>
                  <TableCell>{laudo.descricao}</TableCell>
                  <TableCell>
                    {format(new Date(laudo.data_emissao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge className={laudo.assinado ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                      {laudo.assinado ? "Assinado" : "Pendente"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LaudosPaciente;
