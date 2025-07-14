
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
      // Change approach to first get the consultations, then fetch patient data separately
      const { data: consultasData, error: consultasError } = await supabase
        .from('consultas')
        .select('id_paciente, data_hora')
        .eq('id_medico', medicoId)
        .eq('status', 'realizada');
      
      if (consultasError) throw consultasError;

      if (!consultasData || consultasData.length === 0) {
        setPacientes([]);
        setIsLoading(false);
        return;
      }
      
      // Get unique patient IDs
      const uniquePacienteIds = [...new Set(consultasData.map(c => c.id_paciente).filter(Boolean))];
      
      if (uniquePacienteIds.length === 0) {
        setPacientes([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch patient data for each unique patient ID
      const { data: pacientesData, error: pacientesError } = await supabase
        .from('pacientes')
        .select('id, nome')
        .in('id', uniquePacienteIds);
      
      if (pacientesError) throw pacientesError;
      
      // Create final patient data with last consultation date
      const pacientesWithUltimaConsulta = pacientesData?.map(paciente => {
        // Find all consultations for this patient
        const pacienteConsultas = consultasData.filter(c => c.id_paciente === paciente.id);
        // Get latest consultation date
        const ultimaConsulta = pacienteConsultas.reduce((latest, consulta) => {
          return new Date(consulta.data_hora) > new Date(latest) 
            ? consulta.data_hora 
            : latest;
        }, pacienteConsultas[0]?.data_hora || '');
        
        return {
          id: paciente.id,
          nome: paciente.nome,
          ultima_consulta: ultimaConsulta
        };
      }) || [];
      
      setPacientes(pacientesWithUltimaConsulta);
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
