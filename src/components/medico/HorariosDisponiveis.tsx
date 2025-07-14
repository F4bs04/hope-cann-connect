import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HorariosPublicos from './HorariosPublicos';
import { useHorariosManager } from '@/hooks/useHorariosManager';
import { Clock, Calendar, Check, Plus, Trash2, AlertCircle } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const diasSemana = [
  { value: "segunda-feira", label: "Segunda-feira" },
  { value: "terça-feira", label: "Terça-feira" },
  { value: "quarta-feira", label: "Quarta-feira" },
  { value: "quinta-feira", label: "Quinta-feira" },
  { value: "sexta-feira", label: "Sexta-feira" },
  { value: "sábado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

const HorariosDisponiveis: React.FC = () => {
  const { horarios, loading, saving, adicionarHorario: addHorario, removerHorario } = useHorariosManager();
  
  // Form state para adicionar novo horário
  const [diaAtual, setDiaAtual] = useState<string>("");
  const [horaInicio, setHoraInicio] = useState<string>("");
  const [horaFim, setHoraFim] = useState<string>("");

  const handleAdicionarHorario = async () => {
    const success = await addHorario(diaAtual, horaInicio, horaFim);
    if (success) {
      setDiaAtual("");
      setHoraInicio("");
      setHoraFim("");
    }
  };

  const formatDiaSemana = (dia: string) => {
    return diasSemana.find(d => d.value === dia)?.label || dia;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Horários Disponíveis</h2>
          <p className="text-muted-foreground">
            Configure seus horários para que os pacientes possam agendar consultas
          </p>
        </div>
        <Badge variant={horarios.length > 0 ? "default" : "secondary"}>
          {horarios.length > 0 ? "Disponível" : "Indisponível"}
        </Badge>
      </div>

      <Tabs defaultValue="gerenciar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gerenciar">Gerenciar Horários</TabsTrigger>
          <TabsTrigger value="adicionar">Adicionar Horário</TabsTrigger>
          <TabsTrigger value="visualizar">Como Pacientes Veem</TabsTrigger>
        </TabsList>

        <TabsContent value="gerenciar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Seus Horários Disponíveis
              </CardTitle>
              <CardDescription>
                Estes são os horários que os pacientes podem visualizar para agendar consultas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {horarios.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Você ainda não tem horários disponíveis configurados. 
                    Adicione alguns horários para que os pacientes possam agendar consultas com você.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid gap-4">
                  {horarios.map((horario) => (
                    <div 
                      key={horario.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{formatDiaSemana(horario.dia_semana)}</p>
                          <p className="text-sm text-muted-foreground">
                            {horario.hora_inicio} às {horario.hora_fim}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removerHorario(horario.id)}
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualizar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualização dos Pacientes</CardTitle>
              <CardDescription>
                Veja como seus horários aparecem para os pacientes na busca por médicos disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HorariosPublicos />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adicionar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Adicionar Novo Horário
              </CardTitle>
              <CardDescription>
                Configure um novo horário de atendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dia">Dia da Semana</Label>
                  <Select value={diaAtual} onValueChange={setDiaAtual}>
                    <SelectTrigger id="dia">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {diasSemana.map((dia) => (
                        <SelectItem key={dia.value} value={dia.value}>
                          {dia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora-inicio">Hora de Início</Label>
                  <Input
                    id="hora-inicio"
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora-fim">Hora de Término</Label>
                  <Input
                    id="hora-fim"
                    type="time"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleAdicionarHorario} 
                disabled={saving || !diaAtual || !horaInicio || !horaFim}
                className="w-full"
              >
                {saving ? "Adicionando..." : "Adicionar Horário"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {horarios.length > 0 && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>
            Seus horários estão configurados e visíveis para os pacientes! 
            Eles podem agora agendar consultas nos horários que você disponibilizou.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default HorariosDisponiveis;