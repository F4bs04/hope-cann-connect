
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Loader2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AtestadosPacienteProps {
  pacienteId: number;
}

interface Atestado {
  id: number;
  data_emissao: string;
  tempo_afastamento: number;
  unidade_tempo: string;
  justificativa: string;
  assinado: boolean;
  cid?: string;
}

const AtestadosPaciente: React.FC<AtestadosPacienteProps> = ({ pacienteId }) => {
  const [atestados, setAtestados] = useState<Atestado[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (pacienteId <= 0) {
      setLoading(false);
      return;
    }
    
    const fetchAtestados = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('atestados')
          .select('*')
          .eq('id_paciente', pacienteId)
          .order('data_emissao', { ascending: false });
        
        if (error) throw error;
        
        setAtestados(data || []);
      } catch (error) {
        console.error("Erro ao buscar atestados:", error);
        toast({
          title: "Erro ao buscar atestados",
          description: "Não foi possível carregar seus atestados. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAtestados();
  }, [pacienteId, toast]);

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Seus Atestados</h2>
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-hopecann-teal" />
        </div>
      </div>
    );
  }

  if (atestados.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Seus Atestados</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum atestado encontrado</h3>
            <p className="text-gray-500">
              Você ainda não possui atestados registrados no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Seus Atestados</h2>
      
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tempo de Afastamento</TableHead>
                <TableHead>Justificativa</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atestados.map((atestado) => (
                <TableRow key={atestado.id}>
                  <TableCell>
                    {format(new Date(atestado.data_emissao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{atestado.tempo_afastamento} {atestado.unidade_tempo}</span>
                    </div>
                  </TableCell>
                  <TableCell>{atestado.justificativa}</TableCell>
                  <TableCell>
                    <Badge className={atestado.assinado ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                      {atestado.assinado ? "Assinado" : "Pendente"}
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

export default AtestadosPaciente;
