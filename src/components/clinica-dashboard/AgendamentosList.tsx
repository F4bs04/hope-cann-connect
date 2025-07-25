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
  id: string;
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
      // Buscar dados simulados por enquanto já que não temos appointments na estrutura nova
      const agendamentosSimulados: Agendamento[] = [
        {
          id: '1',
          data: new Date().toISOString().split('T')[0],
          horario: '09:00',
          paciente: 'Maria Silva',
          medico: 'Dr. João Santos',
          status: 'agendada'
        },
        {
          id: '2', 
          data: new Date().toISOString().split('T')[0],
          horario: '14:30',
          paciente: 'Carlos Oliveira',
          medico: 'Dra. Ana Costa',
          status: 'realizada'
        }
      ];
      
      setAgendamentos(agendamentosSimulados);
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
                      agendamento.status === 'realizada' ? 'default' :
                      'outline'
                    }
                  >
                    {agendamento.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {agendamentos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum agendamento encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};