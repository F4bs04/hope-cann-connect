
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface Agendamento {
  id: number;
  data: string;
  horario: string;
  paciente: string;
  medico: string;
  status: string;
}

export const AgendamentosList = () => {
  const [agendamentos, setAgendamentos] = React.useState<Agendamento[]>([]);
  
  React.useEffect(() => {
    const fetchAgendamentos = async () => {
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          id,
          data_hora,
          id_paciente,
          id_medico,
          status
        `)
        .order('data_hora', { ascending: true });
      
      if (error) {
        console.error("Error fetching agendamentos:", error);
        return;
      }
      
      if (data) {
        // Buscar nomes dos pacientes e médicos
        const pacienteIds = [...new Set(data.map(c => c.id_paciente).filter(Boolean))];
        const medicoIds = [...new Set(data.map(c => c.id_medico).filter(Boolean))];

        const [pacientesResponse, medicosResponse] = await Promise.all([
          supabase.from('pacientes').select('id, nome').in('id', pacienteIds),
          supabase.from('medicos').select('id, nome').in('id', medicoIds)
        ]);

        const pacientesMap = new Map(
          (pacientesResponse.data || []).map(p => [p.id, p.nome])
        );
        const medicosMap = new Map(
          (medicosResponse.data || []).map(m => [m.id, m.nome])
        );

        // Extract date and time from data_hora
        const formattedData = data.map(item => {
          const dateTime = new Date(item.data_hora);
          return {
            id: item.id,
            data: dateTime.toISOString().split('T')[0], // Extract just the date part
            horario: dateTime.toTimeString().substring(0, 5), // Extract hours and minutes
            paciente: pacientesMap.get(item.id_paciente) || 'N/A',
            medico: medicosMap.get(item.id_medico) || 'N/A',
            status: item.status
          };
        });
        setAgendamentos(formattedData);
      }
    };
    
    fetchAgendamentos();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agendamentos.map((agendamento) => (
              <TableRow key={agendamento.id}>
                <TableCell>
                  {format(new Date(agendamento.data), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>{agendamento.horario}</TableCell>
                <TableCell>{agendamento.paciente}</TableCell>
                <TableCell>{agendamento.medico}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      agendamento.status === 'cancelada' ? 'destructive' :
                      agendamento.status === 'realizada' ? 'success' :
                      'default'
                    }
                  >
                    {agendamento.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
