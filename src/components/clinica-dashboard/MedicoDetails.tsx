
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Calendar } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface MedicoDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicoId: number | null;
}

interface Paciente {
  id: number;
  nome: string;
  ultima_consulta: string;
}

export function MedicoDetails({ open, onOpenChange, medicoId }: MedicoDetailsProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [pacientes, setPacientes] = React.useState<Paciente[]>([]);
  const [consultasCount, setConsultasCount] = React.useState(0);

  React.useEffect(() => {
    if (medicoId && open) {
      fetchPacientes();
      fetchConsultasCount();
    }
  }, [medicoId, open]);

  const fetchPacientes = async () => {
    if (!medicoId) return;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          id_paciente,
          pacientes_app (
            id,
            nome
          ),
          data_hora
        `)
        .eq('id_medico', medicoId)
        .eq('status', 'realizada')
        .order('data_hora', { ascending: false });

      if (error) throw error;

      const uniquePacientes = data.reduce((acc: Paciente[], curr) => {
        const existingPaciente = acc.find(p => p.id === curr.pacientes_app.id);
        if (!existingPaciente) {
          acc.push({
            id: curr.pacientes_app.id,
            nome: curr.pacientes_app.nome,
            ultima_consulta: curr.data_hora
          });
        }
        return acc;
      }, []);

      setPacientes(uniquePacientes);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConsultasCount = async () => {
    if (!medicoId) return;
    
    try {
      const { count, error } = await supabase
        .from('consultas')
        .select('*', { count: 'exact', head: true })
        .eq('id_medico', medicoId)
        .eq('status', 'realizada');

      if (error) throw error;
      setConsultasCount(count || 0);
    } catch (error) {
      console.error('Erro ao buscar total de consultas:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Detalhes do Médico</SheetTitle>
          <SheetDescription>
            Visualize os detalhes e pacientes atendidos por este médico.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Total de Pacientes</span>
              </div>
              <p className="mt-1 text-2xl font-semibold">{pacientes.length}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Total de Consultas</span>
              </div>
              <p className="mt-1 text-2xl font-semibold">{consultasCount}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Pacientes Atendidos</h3>
            {isLoading ? (
              <p>Carregando pacientes...</p>
            ) : pacientes.length === 0 ? (
              <p className="text-gray-500">Nenhum paciente atendido ainda.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Última Consulta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pacientes.map((paciente) => (
                    <TableRow key={paciente.id}>
                      <TableCell>{paciente.nome}</TableCell>
                      <TableCell>
                        {new Date(paciente.ultima_consulta).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
