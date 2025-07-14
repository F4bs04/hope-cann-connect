import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AgendarConsultaPaciente from '@/components/paciente/AgendarConsultaPaciente';
import { Calendar, Users, Clock } from 'lucide-react';

const TesteAgendamento = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4 flex items-center justify-center gap-3">
            <Calendar className="h-10 w-10" />
            Sistema Integrado de Agendamento
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sistema sincronizado entre médicos e pacientes com validação em tempo real de horários disponíveis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-primary">
                <Users className="h-5 w-5" />
                Médicos Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Apenas médicos aprovados e com status ativo aparecem na lista
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-primary">
                <Clock className="h-5 w-5" />
                Horários Sincronizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Horários baseados na configuração de disponibilidade do médico
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-primary">
                <Calendar className="h-5 w-5" />
                Validação em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Verificação automática de conflitos antes do agendamento
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-primary/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">
              Agendar Nova Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AgendarConsultaPaciente
              onSuccess={() => {
                console.log('Consulta agendada com sucesso!');
              }}
            />
          </CardContent>
        </Card>

        <div className="mt-8 bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
          <h3 className="text-lg font-semibold text-primary mb-4">Funcionalidades Integradas:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">Para Pacientes:</h4>
              <ul className="space-y-1">
                <li>• Visualização de médicos disponíveis</li>
                <li>• Horários baseados na configuração do médico</li>
                <li>• Validação em tempo real de disponibilidade</li>
                <li>• Interface intuitiva e responsiva</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Para Médicos:</h4>
              <ul className="space-y-1">
                <li>• Configuração de horários de atendimento</li>
                <li>• Agendamento com validação de conflitos</li>
                <li>• Sincronização automática com pacientes</li>
                <li>• Controle de disponibilidade por dia da semana</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TesteAgendamento;