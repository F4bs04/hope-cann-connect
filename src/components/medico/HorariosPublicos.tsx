import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Calendar, User, CheckCircle } from 'lucide-react';

interface HorarioPublico {
  id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
  medico: {
    id: number;
    nome: string;
    especialidade: string;
    status_disponibilidade: boolean;
  };
}

const diasSemana = {
  "segunda-feira": "Segunda-feira",
  "terça-feira": "Terça-feira", 
  "quarta-feira": "Quarta-feira",
  "quinta-feira": "Quinta-feira",
  "sexta-feira": "Sexta-feira",
  "sábado": "Sábado",
  "domingo": "Domingo",
};

const HorariosPublicos: React.FC = () => {
  const [horariosPublicos, setHorariosPublicos] = useState<HorarioPublico[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHorariosPublicos = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os horários disponíveis com informações dos médicos
      const { data, error } = await supabase
        .from('horarios_disponiveis')
        .select(`
          id,
          dia_semana,
          hora_inicio,
          hora_fim,
          medicos!inner (
            id,
            nome,
            especialidade,
            status_disponibilidade,
            aprovado
          )
        `)
        .eq('medicos.aprovado', true)
        .eq('medicos.status_disponibilidade', true)
        .order('dia_semana', { ascending: true });

      if (error) throw error;

      // Transformar os dados para o formato esperado
      const horariosFormatados = (data || []).map(item => ({
        id: item.id,
        dia_semana: item.dia_semana,
        hora_inicio: item.hora_inicio,
        hora_fim: item.hora_fim,
        medico: item.medicos
      }));

      setHorariosPublicos(horariosFormatados);
    } catch (error: any) {
      console.error('Erro ao buscar horários públicos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorariosPublicos();
  }, []);

  const agruparPorMedico = () => {
    const grupos: { [key: number]: HorarioPublico[] } = {};
    
    horariosPublicos.forEach(horario => {
      const medicoId = horario.medico.id;
      if (!grupos[medicoId]) {
        grupos[medicoId] = [];
      }
      grupos[medicoId].push(horario);
    });
    
    return grupos;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const gruposPorMedico = agruparPorMedico();

  if (Object.keys(gruposPorMedico).length === 0) {
    return (
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          Ainda não há médicos com horários disponíveis para agendamento.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Médicos Disponíveis</h2>
        <p className="text-muted-foreground">
          Estes são os médicos que estão com horários disponíveis para agendamento
        </p>
      </div>

      <div className="grid gap-6">
        {Object.entries(gruposPorMedico).map(([medicoId, horarios]) => {
          const medico = horarios[0].medico;
          
          // Agrupar horários por dia da semana
          const horariosPorDia: { [key: string]: HorarioPublico[] } = {};
          horarios.forEach(horario => {
            if (!horariosPorDia[horario.dia_semana]) {
              horariosPorDia[horario.dia_semana] = [];
            }
            horariosPorDia[horario.dia_semana].push(horario);
          });

          return (
            <Card key={medicoId} className="overflow-hidden">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {medico.nome}
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {medico.especialidade}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="default">Disponível</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horários Disponíveis
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(horariosPorDia).map(([dia, horariosInner]) => (
                      <div key={dia} className="space-y-2">
                        <h5 className="font-medium text-sm">
                          {diasSemana[dia as keyof typeof diasSemana] || dia}
                        </h5>
                        <div className="space-y-1">
                          {horariosInner.map(horario => (
                            <div 
                              key={horario.id}
                              className="text-sm p-2 bg-secondary/50 rounded-md flex items-center gap-2"
                            >
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {horario.hora_inicio} - {horario.hora_fim}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default HorariosPublicos;