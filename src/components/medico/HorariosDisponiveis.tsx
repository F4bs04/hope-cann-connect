import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HorariosPublicos from './HorariosPublicos';
import { useHorarios } from '@/hooks/useHorarios';
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, Calendar, Check, X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface HorarioDisponivel {
  id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
}

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
  const { userInfo, loading: loadingUser } = useCurrentUserInfo();
  const { toast } = useToast();
  const [horariosExistentes, setHorariosExistentes] = useState<HorarioDisponivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state para adicionar novo horário
  const [diaAtual, setDiaAtual] = useState<string>("");
  const [horaInicio, setHoraInicio] = useState<string>("");
  const [horaFim, setHoraFim] = useState<string>("");

  // Buscar horários existentes
  const fetchHorarios = async () => {
    if (!userInfo.medicoId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('horarios_disponiveis')
        .select('*')
        .eq('id_medico', userInfo.medicoId)
        .order('dia_semana', { ascending: true });

      if (error) throw error;
      
      setHorariosExistentes(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar horários:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar horários",
        description: "Não foi possível carregar seus horários disponíveis.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo.medicoId && !loadingUser) {
      fetchHorarios();
    }
  }, [userInfo.medicoId, loadingUser]);

  const adicionarHorario = async () => {
    if (!diaAtual || !horaInicio || !horaFim) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Preencha todos os campos do horário",
      });
      return;
    }

    if (horaInicio >= horaFim) {
      toast({
        variant: "destructive",
        title: "Horário inválido",
        description: "A hora de início deve ser antes da hora de fim",
      });
      return;
    }

    // Verificar sobreposição
    const overlapping = horariosExistentes.some(h => 
      h.dia_semana === diaAtual && 
      ((horaInicio >= h.hora_inicio && horaInicio < h.hora_fim) || 
       (horaFim > h.hora_inicio && horaFim <= h.hora_fim) ||
       (horaInicio <= h.hora_inicio && horaFim >= h.hora_fim))
    );

    if (overlapping) {
      toast({
        variant: "destructive",
        title: "Horário sobreposto",
        description: "Este horário se sobrepõe a outro já adicionado no mesmo dia",
      });
      return;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('horarios_disponiveis')
        .insert({
          id_medico: userInfo.medicoId,
          dia_semana: diaAtual,
          hora_inicio: horaInicio,
          hora_fim: horaFim
        })
        .select()
        .single();

      if (error) throw error;

      setHorariosExistentes([...horariosExistentes, data]);
      setDiaAtual("");
      setHoraInicio("");
      setHoraFim("");

      // Atualizar status de disponibilidade do médico
      await supabase
        .from('medicos')
        .update({ status_disponibilidade: true })
        .eq('id', userInfo.medicoId);

      toast({
        title: "Horário adicionado",
        description: "Seu horário foi adicionado e já está disponível para agendamentos.",
      });
    } catch (error: any) {
      console.error('Erro ao adicionar horário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar horário",
        description: "Não foi possível adicionar o horário. Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const removerHorario = async (id: number) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('horarios_disponiveis')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHorariosExistentes(horariosExistentes.filter(h => h.id !== id));
      
      toast({
        title: "Horário removido",
        description: "O horário foi removido da sua disponibilidade.",
      });
    } catch (error: any) {
      console.error('Erro ao remover horário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover horário",
        description: "Não foi possível remover o horário. Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const alternarStatusDisponibilidade = async () => {
    try {
      setSaving(true);
      const novoStatus = horariosExistentes.length > 0 ? true : false;
      
      const { error } = await supabase
        .from('medicos')
        .update({ status_disponibilidade: novoStatus })
        .eq('id', userInfo.medicoId);

      if (error) throw error;

      toast({
        title: novoStatus ? "Disponibilidade ativada" : "Disponibilidade desativada",
        description: novoStatus 
          ? "Você está agora disponível para agendamentos" 
          : "Você não está mais disponível para novos agendamentos",
      });
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        variant: "destructive",
        title: "Erro ao alterar status",
        description: "Não foi possível alterar seu status de disponibilidade.",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDiaSemana = (dia: string) => {
    return diasSemana.find(d => d.value === dia)?.label || dia;
  };

  if (loadingUser || loading) {
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
        <Badge variant={horariosExistentes.length > 0 ? "default" : "secondary"}>
          {horariosExistentes.length > 0 ? "Disponível" : "Indisponível"}
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
              {horariosExistentes.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Você ainda não tem horários disponíveis configurados. 
                    Adicione alguns horários para que os pacientes possam agendar consultas com você.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid gap-4">
                  {horariosExistentes.map((horario) => (
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
                onClick={adicionarHorario} 
                disabled={saving || !diaAtual || !horaInicio || !horaFim}
                className="w-full"
              >
                {saving ? "Adicionando..." : "Adicionar Horário"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {horariosExistentes.length > 0 && (
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