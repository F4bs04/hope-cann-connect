
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Users, FileText, History, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, X, Check, Plus, MessageSquare, Eye } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Mock data
const pacientesMock = [
  { id: 1, nome: 'João Silva', idade: 42, condicao: 'Dor crônica', ultimaConsulta: '2025-03-15' },
  { id: 2, nome: 'Maria Oliveira', idade: 35, condicao: 'Ansiedade', ultimaConsulta: '2025-03-28' },
  { id: 3, nome: 'Carlos Souza', idade: 57, condicao: 'Parkinson', ultimaConsulta: '2025-04-02' },
  { id: 4, nome: 'Ana Pereira', idade: 29, condicao: 'Epilepsia', ultimaConsulta: '2025-03-20' },
  { id: 5, nome: 'Roberto Almeida', idade: 63, condicao: 'Fibromialgia', ultimaConsulta: '2025-04-05' }
];

const consultasMock = [
  { id: 1, paciente: 'João Silva', data: '2025-04-15', horario: '09:00', status: 'agendada' },
  { id: 2, paciente: 'Maria Oliveira', data: '2025-04-16', horario: '14:30', status: 'agendada' },
  { id: 3, paciente: 'Carlos Souza', data: '2025-04-12', horario: '10:15', status: 'realizada' },
  { id: 4, paciente: 'Ana Pereira', data: '2025-04-03', horario: '15:45', status: 'realizada' },
  { id: 5, paciente: 'Roberto Almeida', data: '2025-04-18', horario: '11:00', status: 'agendada' }
];

const receitasMock = [
  { id: 1, paciente: 'João Silva', medicamento: 'Óleo CBD 5%', posologia: '10 gotas, 2x ao dia', data: '2025-04-12' },
  { id: 2, paciente: 'Maria Oliveira', medicamento: 'Óleo CBD:THC 20:1', posologia: '5 gotas, à noite', data: '2025-04-10' },
  { id: 3, paciente: 'Ana Pereira', medicamento: 'Óleo CBD 3%', posologia: '8 gotas, 3x ao dia', data: '2025-04-03' }
];

const mensagensMock = [
  { id: 1, paciente: 'João Silva', mensagem: 'Doutor, estou sentindo uma melhora significativa com o tratamento.', data: '2025-04-11', lida: true },
  { id: 2, paciente: 'Maria Oliveira', mensagem: 'Tenho algumas dúvidas sobre os efeitos colaterais do medicamento.', data: '2025-04-14', lida: false },
  { id: 3, paciente: 'Roberto Almeida', mensagem: 'Posso aumentar a dosagem? Ainda estou sentindo dores.', data: '2025-04-13', lida: false }
];

const horariosDisponiveis = {
  manha: ['08:00', '09:00', '10:00', '11:00'],
  tarde: ['13:00', '14:00', '15:00', '16:00', '17:00']
};

// Tipos
type Paciente = typeof pacientesMock[0];
type Consulta = typeof consultasMock[0];
type Receita = typeof receitasMock[0];
type Mensagem = typeof mensagensMock[0];

const AreaMedico = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(currentDate, { weekStartsOn: 0 }));
  const [selectedSlot, setSelectedSlot] = useState<{day: Date, time: string} | null>(null);
  const [horarioDialogOpen, setHorarioDialogOpen] = useState(false);
  const [receitaDialogOpen, setReceitaDialogOpen] = useState(false);
  const [consultaDialogOpen, setConsultaDialogOpen] = useState(false);
  const [prontuarioDialogOpen, setProntuarioDialogOpen] = useState(false);
  const [mensagemDialogOpen, setMensagemDialogOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [selectedMensagem, setSelectedMensagem] = useState<Mensagem | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensMock);
  const [consultas, setConsultas] = useState<Consulta[]>(consultasMock);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedViewDay, setSelectedViewDay] = useState<Date>(new Date());
  const [horariosConfig, setHorariosConfig] = useState({
    segunda: [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde],
    terca: [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde],
    quarta: [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde],
    quinta: [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde],
    sexta: [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde],
    sabado: [...horariosDisponiveis.manha],
    domingo: []
  });

  // Navegar entre semanas
  const nextWeek = () => {
    setSelectedWeekStart(addWeeks(selectedWeekStart, 1));
  };

  const prevWeek = () => {
    setSelectedWeekStart(subWeeks(selectedWeekStart, 1));
  };

  // Navegar entre dias (para visualização diária)
  const nextDay = () => {
    setSelectedViewDay(addDays(selectedViewDay, 1));
  };

  const prevDay = () => {
    setSelectedViewDay(addDays(selectedViewDay, -1));
  };

  // Função para formatar o nome do dia da semana
  const formatWeekday = (date: Date): string => {
    return format(date, 'EEEE', { locale: ptBR });
  };

  // Responder mensagem
  const handleResponderMensagem = () => {
    if (selectedMensagem) {
      const updatedMensagens = mensagens.map(msg => 
        msg.id === selectedMensagem.id ? { ...msg, lida: true } : msg
      );
      setMensagens(updatedMensagens);
      setMensagemDialogOpen(false);
      
      toast({
        title: "Mensagem enviada",
        description: `Resposta enviada para ${selectedMensagem.paciente}`,
      });
    }
  };

  // Cancelar consulta
  const handleCancelarConsulta = (consultaId: number) => {
    const updatedConsultas = consultas.filter(c => c.id !== consultaId);
    setConsultas(updatedConsultas);
    
    toast({
      title: "Consulta cancelada",
      description: "A consulta foi cancelada e o paciente foi notificado",
    });
  };

  // Adicionar horário disponível
  const handleAdicionarHorario = () => {
    if (selectedSlot) {
      const diaSemana = formatWeekday(selectedSlot.day).toLowerCase() as keyof typeof horariosConfig;
      
      // Verificar se o horário já está na lista
      if (!horariosConfig[diaSemana].includes(selectedSlot.time)) {
        setHorariosConfig({
          ...horariosConfig,
          [diaSemana]: [...horariosConfig[diaSemana], selectedSlot.time].sort()
        });
        
        toast({
          title: "Horário adicionado",
          description: `${selectedSlot.time} adicionado para ${format(selectedSlot.day, 'EEEE', { locale: ptBR })}`,
        });
      }
      
      setHorarioDialogOpen(false);
      setSelectedSlot(null);
    }
  };

  // Remover horário
  const handleRemoverHorario = (day: Date, time: string) => {
    const diaSemana = formatWeekday(day).toLowerCase() as keyof typeof horariosConfig;
    const updatedHorarios = horariosConfig[diaSemana].filter(t => t !== time);
    
    setHorariosConfig({
      ...horariosConfig,
      [diaSemana]: updatedHorarios
    });
    
    toast({
      title: "Horário removido",
      description: `${time} removido de ${format(day, 'EEEE', { locale: ptBR })}`,
    });
  };

  // Adicionar/remover todos os horários para um dia
  const handleToggleDayAvailability = (day: Date, isAvailable: boolean) => {
    const diaSemana = formatWeekday(day).toLowerCase() as keyof typeof horariosConfig;
    
    setHorariosConfig({
      ...horariosConfig,
      [diaSemana]: isAvailable 
        ? [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde]
        : []
    });
    
    toast({
      title: isAvailable ? "Dia disponibilizado" : "Dia indisponibilizado",
      description: `${format(day, 'EEEE', { locale: ptBR })} ${isAvailable ? 'disponível' : 'indisponível'} para consultas`,
    });
  };

  // Renderizar os dias da semana
  const renderDaysOfWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(selectedWeekStart, i);
      days.push(day);
    }
    
    return days.map((day, index) => (
      <div 
        key={index} 
        className="text-center p-2 cursor-pointer hover:bg-gray-50 rounded-md"
        onClick={() => {
          setSelectedViewDay(day);
          setViewMode('day');
        }}
      >
        <div className="font-medium mb-1">
          {format(day, 'EEEE', { locale: ptBR })}
        </div>
        <div className="text-sm">
          {format(day, 'dd/MM')}
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {(() => {
            const diaSemana = formatWeekday(day).toLowerCase() as keyof typeof horariosConfig;
            const count = horariosConfig[diaSemana]?.length || 0;
            return count > 0 ? `${count} horários` : 'Indisponível';
          })()}
        </div>
      </div>
    ));
  };

  // Renderizar o seletor de dia para a visualização diária
  const renderDaySelector = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={prevDay}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Dia anterior
        </Button>
        
        <div className="font-medium">
          {format(selectedViewDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </div>
        
        <Button variant="outline" size="sm" onClick={nextDay}>
          Próximo dia
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  };

  // Renderizar os horários disponíveis para visualização semanal
  const renderTimeSlots = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(selectedWeekStart, i);
      const dayName = formatWeekday(day).toLowerCase() as keyof typeof horariosConfig;
      const slots = horariosConfig[dayName] || [];
      days.push({ day, slots });
    }
    
    return days.map((dayInfo, dayIndex) => (
      <div key={dayIndex} className="border-t">
        <div className="py-2 px-2 bg-gray-50 flex justify-between items-center border-b">
          <span className="text-xs font-medium text-gray-500">
            {dayInfo.slots.length > 0 ? `${dayInfo.slots.length} horários` : 'Indisponível'}
          </span>
          <div className="flex items-center gap-2">
            <Switch 
              checked={dayInfo.slots.length > 0}
              onCheckedChange={(checked) => handleToggleDayAvailability(dayInfo.day, checked)}
              size="sm"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7"
              onClick={() => {
                setSelectedDay(dayInfo.day);
                setHorarioDialogOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {Array.isArray(dayInfo.slots) && dayInfo.slots.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 p-1">
            {dayInfo.slots.map((time, timeIndex) => (
              <div 
                key={`${dayIndex}-${timeIndex}`} 
                className="p-1 text-center border rounded-md text-xs flex justify-between items-center"
              >
                <span className="ml-1">{time}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => handleRemoverHorario(dayInfo.day, time)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2 text-center text-gray-400 text-xs">
            Sem horários disponíveis
          </div>
        )}
      </div>
    ));
  };

  // Renderizar os horários para visualização diária
  const renderDayTimeSlots = () => {
    const dayName = formatWeekday(selectedViewDay).toLowerCase() as keyof typeof horariosConfig;
    const allTimeSlots = [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde];
    const availableSlots = horariosConfig[dayName] || [];
    
    return (
      <div className="mt-4">
        <div className="mb-4 flex justify-between items-center">
          <div className="font-medium">
            Disponibilidade para {format(selectedViewDay, "EEEE", { locale: ptBR })}
          </div>
          <Switch 
            checked={availableSlots.length > 0}
            onCheckedChange={(checked) => handleToggleDayAvailability(selectedViewDay, checked)}
          />
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Período da manhã</h3>
            <div className="grid grid-cols-4 gap-2">
              {horariosDisponiveis.manha.map((hora) => {
                const isAvailable = availableSlots.includes(hora);
                return (
                  <Button 
                    key={hora} 
                    variant={isAvailable ? "default" : "outline"} 
                    className={`text-sm ${isAvailable ? 'bg-hopecann-teal text-white' : 'text-gray-700'}`}
                    onClick={() => {
                      if (isAvailable) {
                        handleRemoverHorario(selectedViewDay, hora);
                      } else {
                        const diaSemana = formatWeekday(selectedViewDay).toLowerCase() as keyof typeof horariosConfig;
                        setHorariosConfig({
                          ...horariosConfig,
                          [diaSemana]: [...horariosConfig[diaSemana], hora].sort()
                        });
                        toast({
                          title: "Horário adicionado",
                          description: `${hora} adicionado para ${format(selectedViewDay, 'EEEE', { locale: ptBR })}`,
                        });
                      }
                    }}
                  >
                    {hora} {isAvailable && <Check className="h-3.5 w-3.5 ml-1" />}
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Período da tarde</h3>
            <div className="grid grid-cols-4 gap-2">
              {horariosDisponiveis.tarde.map((hora) => {
                const isAvailable = availableSlots.includes(hora);
                return (
                  <Button 
                    key={hora} 
                    variant={isAvailable ? "default" : "outline"} 
                    className={`text-sm ${isAvailable ? 'bg-hopecann-teal text-white' : 'text-gray-700'}`}
                    onClick={() => {
                      if (isAvailable) {
                        handleRemoverHorario(selectedViewDay, hora);
                      } else {
                        const diaSemana = formatWeekday(selectedViewDay).toLowerCase() as keyof typeof horariosConfig;
                        setHorariosConfig({
                          ...horariosConfig,
                          [diaSemana]: [...horariosConfig[diaSemana], hora].sort()
                        });
                        toast({
                          title: "Horário adicionado",
                          description: `${hora} adicionado para ${format(selectedViewDay, 'EEEE', { locale: ptBR })}`,
                        });
                      }
                    }}
                  >
                    {hora} {isAvailable && <Check className="h-3.5 w-3.5 ml-1" />}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => setViewMode('week')}
          >
            Voltar para visualização semanal
          </Button>
        </div>
      </div>
    );
  };

  // Gerar nova receita
  const handleGerarReceita = () => {
    toast({
      title: "Receita gerada",
      description: "A receita foi gerada e está disponível para download",
    });
    setReceitaDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8 bg-gray-50">
        <div className="hopecann-container">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-hopecann-green">Área do Médico</h1>
                <p className="text-gray-600">Dr. Samuel Rodrigo</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/logout')}>
                  Sair
                </Button>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="agenda" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
              <TabsTrigger value="agenda" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Agenda
              </TabsTrigger>
              <TabsTrigger value="pacientes" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Pacientes
              </TabsTrigger>
              <TabsTrigger value="historico" className="flex items-center gap-2">
                <History className="h-4 w-4" /> Histórico
              </TabsTrigger>
              <TabsTrigger value="receitas" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Receitas
              </TabsTrigger>
              <TabsTrigger value="mensagens" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> 
                Mensagens
                {mensagens && mensagens.filter(m => !m.lida).length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {mensagens.filter(m => !m.lida).length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          
            {/* Agenda e horários */}
            <TabsContent value="agenda" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Disponibilidade</CardTitle>
                  <CardDescription>Configure seus horários disponíveis para consultas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={prevWeek}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Semana anterior
                      </Button>
                      <Button variant="outline" onClick={nextWeek}>
                        Próxima semana <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    
                    <div className="font-medium">
                      {format(selectedWeekStart, "dd/MM")} - {format(addDays(selectedWeekStart, 6), "dd/MM/yyyy")}
                    </div>
                    
                    <ToggleGroup type="single" value={viewMode} onValueChange={(val) => val && setViewMode(val as 'week' | 'day')}>
                      <ToggleGroupItem value="week" aria-label="Visualização semanal">
                        <Calendar className="h-4 w-4 mr-1" /> Semana
                      </ToggleGroupItem>
                      <ToggleGroupItem value="day" aria-label="Visualização diária">
                        <Clock className="h-4 w-4 mr-1" /> Dia
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  
                  {/* Grade de horários - Visualização semanal ou diária */}
                  <div className="border rounded-md bg-white">
                    {viewMode === 'week' ? (
                      <>
                        <div className="grid grid-cols-7">{renderDaysOfWeek()}</div>
                        <div className="grid grid-cols-7">{renderTimeSlots()}</div>
                      </>
                    ) : (
                      <>
                        {renderDaySelector()}
                        {renderDayTimeSlots()}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Consultas</CardTitle>
                  <CardDescription>Consultas agendadas para os próximos dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consultas && consultas.length > 0 ? (
                        consultas.filter(c => c.status === 'agendada').map((consulta) => (
                          <TableRow key={consulta.id}>
                            <TableCell className="font-medium">{consulta.paciente}</TableCell>
                            <TableCell>{consulta.data}</TableCell>
                            <TableCell>{consulta.horario}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Agendada
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    const paciente = pacientesMock.find(p => p.nome === consulta.paciente);
                                    setSelectedPaciente(paciente || null);
                                    setProntuarioDialogOpen(true);
                                  }}
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setConsultaDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleCancelarConsulta(consulta.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            Não há consultas agendadas para os próximos dias
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          
            {/* Lista de pacientes */}
            <TabsContent value="pacientes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meus Pacientes</CardTitle>
                  <CardDescription>Gerenciamento de pacientes e prontuários</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Idade</TableHead>
                        <TableHead>Condição</TableHead>
                        <TableHead>Última Consulta</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pacientesMock && pacientesMock.length > 0 ? (
                        pacientesMock.map((paciente) => (
                          <TableRow key={paciente.id}>
                            <TableCell className="font-medium">{paciente.nome}</TableCell>
                            <TableCell>{paciente.idade} anos</TableCell>
                            <TableCell>{paciente.condicao}</TableCell>
                            <TableCell>{paciente.ultimaConsulta}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPaciente(paciente);
                                    setProntuarioDialogOpen(true);
                                  }}
                                >
                                  Prontuário
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPaciente(paciente);
                                    setReceitaDialogOpen(true);
                                  }}
                                >
                                  Receita
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            Nenhum paciente cadastrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Histórico de consultas */}
            <TabsContent value="historico" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Consultas</CardTitle>
                  <CardDescription>Consultas realizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consultas && consultas.length > 0 ? (
                        consultas.filter(c => c.status === 'realizada').map((consulta) => (
                          <TableRow key={consulta.id}>
                            <TableCell className="font-medium">{consulta.paciente}</TableCell>
                            <TableCell>{consulta.data}</TableCell>
                            <TableCell>{consulta.horario}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                Realizada
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const paciente = pacientesMock.find(p => p.nome === consulta.paciente);
                                  setSelectedPaciente(paciente || null);
                                  setProntuarioDialogOpen(true);
                                }}
                              >
                                Ver detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            Não há consultas realizadas no histórico
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Receitas */}
            <TabsContent value="receitas" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Receitas Emitidas</CardTitle>
                  <CardDescription>Histórico de receitas emitidas para pacientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Medicamento</TableHead>
                        <TableHead>Posologia</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receitasMock && receitasMock.length > 0 ? (
                        receitasMock.map((receita) => (
                          <TableRow key={receita.id}>
                            <TableCell className="font-medium">{receita.paciente}</TableCell>
                            <TableCell>{receita.medicamento}</TableCell>
                            <TableCell>{receita.posologia}</TableCell>
                            <TableCell>{receita.data}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm">
                                  Imprimir
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    const paciente = pacientesMock.find(p => p.nome === receita.paciente);
                                    setSelectedPaciente(paciente || null);
                                    setReceitaDialogOpen(true);
                                  }}
                                >
                                  Renovar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            Nenhuma receita emitida ainda
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Mensagens */}
            <TabsContent value="mensagens" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mensagens de Pacientes</CardTitle>
                  <CardDescription>Comunicação direta com seus pacientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mensagens && mensagens.length > 0 ? (
                        mensagens.map((msg) => (
                          <TableRow key={msg.id} className={!msg.lida ? "bg-blue-50" : ""}>
                            <TableCell className="font-medium">{msg.paciente}</TableCell>
                            <TableCell className="max-w-[300px] truncate">{msg.mensagem}</TableCell>
                            <TableCell>{msg.data}</TableCell>
                            <TableCell>
                              {msg.lida ? (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                  Respondida
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                  Nova
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedMensagem(msg);
                                  setMensagemDialogOpen(true);
                                }}
                              >
                                Responder
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            Nenhuma mensagem recebida
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      
      {/* Diálogo de Configuração de Horário */}
      <Dialog open={horarioDialogOpen} onOpenChange={setHorarioDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Horários</DialogTitle>
            <DialogDescription>
              {selectedDay && `Selecione os horários disponíveis para ${format(selectedDay, 'EEEE', { locale: ptBR })}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Período da manhã</h3>
              <div className="grid grid-cols-4 gap-2">
                {horariosDisponiveis.manha.map((hora) => {
                  const dayName = selectedDay ? formatWeekday(selectedDay).toLowerCase() as keyof typeof horariosConfig : 'segunda';
                  const isSelected = selectedSlot?.time === hora;
                  const isAlreadySelected = selectedDay ? horariosConfig[dayName]?.includes(hora) : false;
                  
                  return (
                    <Button 
                      key={hora} 
                      variant={isSelected ? "default" : isAlreadySelected ? "secondary" : "outline"} 
                      className={`text-sm ${isSelected ? 'bg-hopecann-teal' : ''} ${isAlreadySelected ? 'bg-gray-100' : ''}`}
                      onClick={() => setSelectedSlot({ day: selectedDay!, time: hora })}
                      disabled={isAlreadySelected}
                    >
                      {hora} {isAlreadySelected && <Check className="h-3 w-3 ml-1" />}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Período da tarde</h3>
              <div className="grid grid-cols-4 gap-2">
                {horariosDisponiveis.tarde.map((hora) => {
                  const dayName = selectedDay ? formatWeekday(selectedDay).toLowerCase() as keyof typeof horariosConfig : 'segunda';
                  const isSelected = selectedSlot?.time === hora;
                  const isAlreadySelected = selectedDay ? horariosConfig[dayName]?.includes(hora) : false;
                  
                  return (
                    <Button 
                      key={hora} 
                      variant={isSelected ? "default" : isAlreadySelected ? "secondary" : "outline"} 
                      className={`text-sm ${isSelected ? 'bg-hopecann-teal' : ''} ${isAlreadySelected ? 'bg-gray-100' : ''}`}
                      onClick={() => setSelectedSlot({ day: selectedDay!, time: hora })}
                      disabled={isAlreadySelected}
                    >
                      {hora} {isAlreadySelected && <Check className="h-3 w-3 ml-1" />}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setHorarioDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-hopecann-green hover:bg-hopecann-green/90" 
              onClick={handleAdicionarHorario}
              disabled={!selectedSlot}
            >
              Adicionar Horário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Edição de Consulta */}
      <Dialog open={consultaDialogOpen} onOpenChange={setConsultaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar Consulta</DialogTitle>
            <DialogDescription>
              Selecione uma nova data e horário para a consulta
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nova Data</label>
                <div className="relative">
                  <Input type="date" />
                  <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Novo Horário</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Observação</label>
              <Textarea placeholder="Motivo do reagendamento (opcional)" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConsultaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-hopecann-green hover:bg-hopecann-green/90" 
              onClick={() => {
                toast({
                  title: "Consulta reagendada",
                  description: "A consulta foi reagendada com sucesso",
                });
                setConsultaDialogOpen(false);
              }}
            >
              Confirmar Reagendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Prontuário */}
      <Dialog open={prontuarioDialogOpen} onOpenChange={setProntuarioDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prontuário do Paciente</DialogTitle>
            <DialogDescription>
              {selectedPaciente?.nome} - {selectedPaciente?.idade} anos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Informações Pessoais</h3>
                <Card>
                  <CardContent className="pt-6">
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="font-medium">Nome:</dt>
                        <dd>{selectedPaciente?.nome}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Idade:</dt>
                        <dd>{selectedPaciente?.idade} anos</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Condição:</dt>
                        <dd>{selectedPaciente?.condicao}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Última consulta:</dt>
                        <dd>{selectedPaciente?.ultimaConsulta}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Histórico Médico</h3>
                <Card>
                  <CardContent className="pt-6 space-y-3 text-sm">
                    <p><span className="font-medium">Alergias:</span> Nenhuma conhecida</p>
                    <p><span className="font-medium">Medicações atuais:</span> Anti-inflamatórios convencionais</p>
                    <p><span className="font-medium">Histórico familiar:</span> Sem dados relevantes</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Resumo das Consultas</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">Consulta em 12/04/2025</h4>
                        <span className="text-sm text-gray-500">Dr. Samuel Rodrigo</span>
                      </div>
                      <p className="text-sm">
                        Paciente relata melhora significativa da dor com o uso do óleo CBD 5%. 
                        Sono também melhorou. Mantida a prescrição com ajuste para 15 gotas à noite.
                      </p>
                    </div>
                    <div className="border-b pb-3">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">Consulta em 15/03/2025</h4>
                        <span className="text-sm text-gray-500">Dr. Samuel Rodrigo</span>
                      </div>
                      <p className="text-sm">
                        Primeira consulta. Paciente apresenta quadro de dor crônica há 5 anos.
                        Já tentou diversos tratamentos convencionais sem sucesso satisfatório.
                        Iniciado tratamento com óleo CBD 5%, 10 gotas 2x ao dia.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Adicionar Anotação</h3>
              <Textarea placeholder="Digite suas observações sobre o paciente" className="h-32" />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedPaciente(selectedPaciente);
                  setProntuarioDialogOpen(false);
                  setReceitaDialogOpen(true);
                }}
              >
                Gerar Receita
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setProntuarioDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                className="bg-hopecann-green hover:bg-hopecann-green/90" 
                onClick={() => {
                  toast({
                    title: "Prontuário atualizado",
                    description: "As informações foram salvas com sucesso",
                  });
                  setProntuarioDialogOpen(false);
                }}
              >
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Receita */}
      <Dialog open={receitaDialogOpen} onOpenChange={setReceitaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Receita</DialogTitle>
            <DialogDescription>
              Prescrição para {selectedPaciente?.nome}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Medicamento</label>
              <Select defaultValue="cbd5">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cbd5">Óleo CBD 5%</SelectItem>
                  <SelectItem value="cbd10">Óleo CBD 10%</SelectItem>
                  <SelectItem value="cbdthc201">Óleo CBD:THC 20:1</SelectItem>
                  <SelectItem value="cbdthc101">Óleo CBD:THC 10:1</SelectItem>
                  <SelectItem value="cbdthc11">Óleo CBD:THC 1:1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dosagem</label>
                <Select defaultValue="10">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 gotas</SelectItem>
                    <SelectItem value="10">10 gotas</SelectItem>
                    <SelectItem value="15">15 gotas</SelectItem>
                    <SelectItem value="20">20 gotas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequência</label>
                <Select defaultValue="2xdia">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1xdia">1x ao dia</SelectItem>
                    <SelectItem value="2xdia">2x ao dia</SelectItem>
                    <SelectItem value="3xdia">3x ao dia</SelectItem>
                    <SelectItem value="noite">Apenas à noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Duração do Tratamento</label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Orientações Adicionais</label>
              <Textarea placeholder="Observações e recomendações para o paciente" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceitaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-hopecann-green hover:bg-hopecann-green/90" 
              onClick={handleGerarReceita}
            >
              Gerar e Assinar Receita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Mensagem */}
      <Dialog open={mensagemDialogOpen} onOpenChange={setMensagemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder Mensagem</DialogTitle>
            <DialogDescription>
              Mensagem de {selectedMensagem?.paciente}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm mb-2">{selectedMensagem?.data}</p>
              <p>{selectedMensagem?.mensagem}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sua resposta</label>
              <Textarea placeholder="Digite sua resposta para o paciente" className="h-32" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMensagemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-hopecann-green hover:bg-hopecann-green/90" 
              onClick={handleResponderMensagem}
            >
              Enviar Resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AreaMedico;
