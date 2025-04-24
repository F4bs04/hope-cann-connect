
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
      const { data } = await supabase
        .from('consultas')
        .select(`
          id,
          data,
          horario,
          pacientes (nome),
          medicos (nome),
          status
        `)
        .order('data', { ascending: true });
      
      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          data: item.data,
          horario: item.horario,
          paciente: item.pacientes?.nome || 'N/A',
          medico: item.medicos?.nome || 'N/A',
          status: item.status
        }));
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
