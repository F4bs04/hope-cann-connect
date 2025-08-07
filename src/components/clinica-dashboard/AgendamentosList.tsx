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
  scheduled_at: string;
  patient_name: string;
  doctor_name: string;
  status: string;
  fee?: number;
}

export const AgendamentosList = () => {
  const [agendamentos, setAgendamentos] = React.useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        setIsLoading(true);
        
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select(`
            id,
            scheduled_at,
            status,
            fee,
            patients!inner (
              profiles!inner (full_name)
            ),
            doctors!inner (
              profiles!inner (full_name)
            )
          `)
          .order('scheduled_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Erro ao buscar agendamentos:', error);
          setAgendamentos([]);
          return;
        }

        const agendamentosFormatados: Agendamento[] = (appointments || []).map(appointment => ({
          id: appointment.id,
          scheduled_at: appointment.scheduled_at,
          patient_name: appointment.patients?.profiles?.full_name || 'Paciente não identificado',
          doctor_name: appointment.doctors?.profiles?.full_name || 'Médico não identificado',
          status: appointment.status,
          fee: appointment.fee
        }));
        
        setAgendamentos(agendamentosFormatados);
      } catch (error) {
        console.error('Erro inesperado:', error);
        setAgendamentos([]);
      } finally {
        setIsLoading(false);
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
        {isLoading ? (
          <div className="flex justify-center p-8">
            <p>Carregando agendamentos...</p>
          </div>
        ) : (
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
                    {format(new Date(agendamento.scheduled_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(agendamento.scheduled_at), 'HH:mm')}
                  </TableCell>
                  <TableCell>{agendamento.patient_name}</TableCell>
                  <TableCell>{agendamento.doctor_name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        agendamento.status === 'cancelled' ? 'destructive' :
                        agendamento.status === 'completed' ? 'default' :
                        'outline'
                      }
                    >
                      {agendamento.status === 'scheduled' ? 'Agendada' :
                       agendamento.status === 'completed' ? 'Realizada' :
                       agendamento.status === 'cancelled' ? 'Cancelada' :
                       agendamento.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {agendamentos.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum agendamento encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};