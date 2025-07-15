import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHorariosManager } from '@/hooks/useHorariosManager';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const diasSemana = [
  { value: "segunda-feira", label: "Segunda" },
  { value: "terça-feira", label: "Terça" },
  { value: "quarta-feira", label: "Quarta" },
  { value: "quinta-feira", label: "Quinta" },
  { value: "sexta-feira", label: "Sexta" },
  { value: "sábado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

const SimpleScheduler: React.FC = () => {
  const { horarios, loading, saving, adicionarHorario, removerHorario } = useHorariosManager();
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [horaInicio, setHoraInicio] = useState<string>("");
  const [horaFim, setHoraFim] = useState<string>("");

  const handleAddHorario = async () => {
    if (!selectedDay || !horaInicio || !horaFim) return;
    
    const success = await adicionarHorario(selectedDay, horaInicio, horaFim);
    if (success) {
      setSelectedDay("");
      setHoraInicio("");
      setHoraFim("");
    }
  };

  const getDayLabel = (dia: string) => {
    return diasSemana.find(d => d.value === dia)?.label || dia;
  };

  const groupedHorarios = horarios.reduce((acc, horario) => {
    if (!acc[horario.dia_semana]) {
      acc[horario.dia_semana] = [];
    }
    acc[horario.dia_semana].push(horario);
    return acc;
  }, {} as Record<string, typeof horarios>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Horário Disponível
          </CardTitle>
          <CardDescription>
            Defina os dias e horários que você estará disponível para consultas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Dia da Semana</Label>
              <select 
                value={selectedDay} 
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">Selecione o dia</option>
                {diasSemana.map((dia) => (
                  <option key={dia.value} value={dia.value}>
                    {dia.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Horário de Início</Label>
              <Input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Horário de Fim</Label>
              <Input
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleAddHorario} 
            disabled={saving || !selectedDay || !horaInicio || !horaFim}
            className="w-full"
          >
            {saving ? "Adicionando..." : "Adicionar Horário"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Seus Horários Disponíveis
          </CardTitle>
          <CardDescription>
            Horários configurados para atendimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedHorarios).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum horário configurado ainda. Adicione seus horários disponíveis acima.
            </p>
          ) : (
            <div className="space-y-4">
              {diasSemana.map((dia) => {
                const horariosDay = groupedHorarios[dia.value];
                if (!horariosDay?.length) return null;

                return (
                  <div key={dia.value} className="space-y-2">
                    <h4 className="font-medium">{dia.label}</h4>
                    <div className="grid gap-2">
                      {horariosDay.map((horario) => (
                        <div 
                          key={horario.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {horario.hora_inicio} às {horario.hora_fim}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removerHorario(horario.id)}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleScheduler;