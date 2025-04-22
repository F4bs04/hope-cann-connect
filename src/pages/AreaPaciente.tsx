import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, FileText, CalendarCheck, X, PenSquare, MessageSquare, FileUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import PacienteProfileCard from "@/components/paciente/PacienteProfileCard";

// Tipo para as consultas
interface Consulta {
  id: number;
  medico: string;
  medicoId: number;
  especialidade: string;
  data: Date;
  horario: string;
  tipo: string;
  status: "agendada" | "concluida" | "cancelada";
}

// Tipo para as receitas
interface Receita {
  id: number;
  medico: string;
  medicoId: number;
  especialidade: string;
  data: Date;
  medicamentos: Array<{nome: string, dosagem: string, instrucoes: string}>;
  status: "ativa" | "expirada";
  arquivo: string;
}

const AreaPaciente = () => {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [consultaSelecionada, setConsultaSelecionada] = useState<Consulta | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const auth = localStorage.getItem('isAuthenticated');
    if (!auth) {
      navigate('/login');
      return;
    }
    
    setIsAuthenticated(true);
    
    // Dados fictícios de consultas (em um app real, viriam do backend)
    const mockConsultas: Consulta[] = [
      {
        id: 1,
        medico: "Dra. Ana Santos",
        medicoId: 2,
        especialidade: "Psiquiatra",
        data: new Date(2025, 3, 15), // 15/04/2025
        horario: "14:00",
        tipo: "Primeira Consulta",
        status: "agendada"
      },
      {
        id: 2,
        medico: "Dr. Carlos Mendes",
        medicoId: 3,
        especialidade: "Neurologista",
        data: new Date(2025, 3, 22), // 22/04/2025
        horario: "10:00",
        tipo: "Primeira Consulta",
        status: "agendada"
      },
      {
        id: 3,
        medico: "Dra. Ana Santos",
        medicoId: 2,
        especialidade: "Psiquiatra",
        data: new Date(2025, 2, 10), // 10/03/2025 (já passou)
        horario: "15:00",
        tipo: "Primeira Consulta",
        status: "concluida"
      }
    ];

    // Dados fictícios de receitas
    const mockReceitas: Receita[] = [
      {
        id: 1,
        medico: "Dra. Ana Santos",
        medicoId: 2,
        especialidade: "Psiquiatra",
        data: new Date(2025, 2, 10),
        medicamentos: [
          {
            nome: "Canabidiol 100mg/ml",
            dosagem: "0.2ml, 2x ao dia",
            instrucoes: "Tomar de manhã e à noite, após as refeições"
          }
        ],
        status: "ativa",
        arquivo: "/lovable-uploads/9826141f-2e80-41ba-8792-01e2ed93ac69.png"
      },
      {
        id: 2,
        medico: "Dr. Carlos Mendes",
        medicoId: 3,
        especialidade: "Neurologista",
        data: new Date(2024, 10, 5),
        medicamentos: [
          {
            nome: "Canabidiol 200mg/ml",
            dosagem: "0.5ml, 1x ao dia",
            instrucoes: "Tomar à noite, antes de dormir"
          },
          {
            nome: "Melatonina 5mg",
            dosagem: "1 comprimido por dia",
            instrucoes: "Tomar 30 minutos antes de dormir"
          }
        ],
        status: "expirada",
        arquivo: "/lovable-uploads/9826141f-2e80-41ba-8792-01e2ed93ac69.png"
      }
    ];
    
    setConsultas(mockConsultas);
    setReceitas(mockReceitas);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    navigate('/login');
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso."
    });
  };

  const handleCancelarConsulta = () => {
    if (!consultaSelecionada) return;
    
    setLoading(true);
    
    // Simulação de cancelamento (em um app real, seria uma chamada à API)
    setTimeout(() => {
      setConsultas(prevConsultas => 
        prevConsultas.map(consulta => 
          consulta.id === consultaSelecionada.id 
            ? { ...consulta, status: "cancelada" } 
            : consulta
        )
      );
      
      setShowCancelDialog(false);
      setConsultaSelecionada(null);
      setLoading(false);
      
      toast({
        title: "Consulta cancelada",
        description: "Sua consulta foi cancelada com sucesso."
      });
    }, 1000);
  };

  const handleReagendar = (consulta: Consulta) => {
    navigate('/agendar', { state: { reagendamento: consulta.id } });
  };

  const handleEnviarMensagem = (medicoId: number) => {
    navigate(`/medico/${medicoId}`, { state: { activeTab: 'mensagens' } });
  };

  const perfilPaciente = {
    nome: localStorage.getItem('userEmail') || "Paciente",
    email: localStorage.getItem('userEmail') || "email@example.com",
    genero: "Masculino",
    dataNascimento: "1992-05-20",
    fotoUrl: "", // or a link to the image
  };

  if (!isAuthenticated) {
    return null; // Página será redirecionada no useEffect
  }

  const consultasAgendadas = consultas.filter(c => c.status === "agendada");
  const consultasConcluidas = consultas.filter(c => c.status === "concluida");
  const consultasCanceladas = consultas.filter(c => c.status === "cancelada");
  const receitasAtivas = receitas.filter(r => r.status === "ativa");
  const receitasExpiradas = receitas.filter(r => r.status === "expirada");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="hopecann-container">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="w-full md:w-1/3">
              <PacienteProfileCard
                nome={perfilPaciente.nome}
                email={perfilPaciente.email}
                genero={perfilPaciente.genero}
                dataNascimento={perfilPaciente.dataNascimento}
                fotoUrl={perfilPaciente.fotoUrl}
              />
              
              <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <h3 className="text-lg font-semibold mb-4">Resumo</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-gray-700">
                    <Calendar size={18} className="text-hopecann-teal" />
                    <span>{consultasAgendadas.length} consultas agendadas</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <FileText size={18} className="text-blue-600" />
                    <span>{receitasAtivas.length} receitas ativas</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CalendarCheck size={18} className="text-green-600" />
                    <span>{consultasConcluidas.length} consultas realizadas</span>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button 
                    onClick={() => navigate('/agendar')}
                    className="w-full bg-hopecann-teal hover:bg-hopecann-teal/90"
                  >
                    Agendar Nova Consulta
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-6">Minha Agenda</h2>
                
                <Tabs defaultValue="agendadas" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="agendadas" className="text-sm md:text-base">
                      Agendadas ({consultasAgendadas.length})
                    </TabsTrigger>
                    <TabsTrigger value="concluidas" className="text-sm md:text-base">
                      Concluídas ({consultasConcluidas.length})
                    </TabsTrigger>
                    <TabsTrigger value="receitas" className="text-sm md:text-base">
                      Receitas ({receitas.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="agendadas">
                    {consultasAgendadas.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <CalendarCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma consulta agendada</h3>
                        <p className="text-gray-500 mb-4">Você não possui consultas agendadas no momento.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {consultasAgendadas.map((consulta) => (
                          <div key={consulta.id} className="border rounded-lg p-4 hover:border-hopecann-teal/50 transition-colors">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <Link to={`/medico/${consulta.medicoId}`} className="font-semibold text-lg hover:text-hopecann-teal">
                                  {consulta.medico}
                                </Link>
                                <p className="text-hopecann-teal mb-2">{consulta.especialidade}</p>
                                
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                  <Calendar size={16} />
                                  <span>{format(consulta.data, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                  <Clock size={16} />
                                  <span>{consulta.horario}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-gray-600">
                                  <FileText size={16} />
                                  <span>{consulta.tipo}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 mt-4 md:mt-0">
                                <Button 
                                  variant="outline" 
                                  className="text-hopecann-teal border-hopecann-teal hover:bg-hopecann-teal/10"
                                  onClick={() => handleEnviarMensagem(consulta.medicoId)}
                                >
                                  <MessageSquare size={16} className="mr-2" />
                                  Enviar Mensagem
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  className="text-hopecann-teal border-hopecann-teal hover:bg-hopecann-teal/10"
                                  onClick={() => handleReagendar(consulta)}
                                >
                                  <PenSquare size={16} className="mr-2" />
                                  Reagendar
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                                  onClick={() => {
                                    setConsultaSelecionada(consulta);
                                    setShowCancelDialog(true);
                                  }}
                                >
                                  <X size={16} className="mr-2" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="concluidas">
                    {consultasConcluidas.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">Nenhuma consulta concluída</h3>
                        <p className="text-gray-500">Seu histórico de consultas aparecerá aqui.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {consultasConcluidas.map((consulta) => (
                          <div key={consulta.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <Link to={`/medico/${consulta.medicoId}`} className="font-semibold text-lg hover:text-hopecann-teal">
                                  {consulta.medico}
                                </Link>
                                <p className="text-hopecann-teal mb-2">{consulta.especialidade}</p>
                                
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                  <Calendar size={16} />
                                  <span>{format(consulta.data, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                  <Clock size={16} />
                                  <span>{consulta.horario}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-gray-600">
                                  <FileText size={16} />
                                  <span>{consulta.tipo}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 mt-4 md:mt-0">
                                <Button 
                                  variant="outline" 
                                  className="text-hopecann-teal border-hopecann-teal hover:bg-hopecann-teal/10"
                                  onClick={() => handleEnviarMensagem(consulta.medicoId)}
                                >
                                  <MessageSquare size={16} className="mr-2" />
                                  Enviar Mensagem
                                </Button>
                                
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Concluída
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="receitas">
                    {receitas.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">Nenhuma receita disponível</h3>
                        <p className="text-gray-500">Suas receitas médicas aparecerão aqui após consultas.</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <Card>
                          <CardHeader>
                            <h3 className="text-lg font-medium">Receitas Ativas</h3>
                          </CardHeader>
                          <CardContent>
                            {receitasAtivas.length === 0 ? (
                              <p className="text-gray-500 text-center py-4">Nenhuma receita ativa no momento.</p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Médico</TableHead>
                                    <TableHead>Medicamentos</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {receitasAtivas.map(receita => (
                                    <TableRow key={receita.id}>
                                      <TableCell>{format(receita.data, "dd/MM/yyyy")}</TableCell>
                                      <TableCell>
                                        <Link to={`/medico/${receita.medicoId}`} className="hover:text-hopecann-teal">
                                          {receita.medico}
                                        </Link>
                                        <div className="text-xs text-gray-500">{receita.especialidade}</div>
                                      </TableCell>
                                      <TableCell>
                                        <ul className="list-disc pl-5">
                                          {receita.medicamentos.map((med, index) => (
                                            <li key={index} className="text-sm">
                                              {med.nome} - {med.dosagem}
                                            </li>
                                          ))}
                                        </ul>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                          <Button variant="outline" size="sm">
                                            <FileUp size={16} className="mr-1" />
                                            Ver PDF
                                          </Button>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="text-hopecann-teal border-hopecann-teal hover:bg-hopecann-teal/10"
                                            onClick={() => handleEnviarMensagem(receita.medicoId)}
                                          >
                                            <MessageSquare size={16} className="mr-1" />
                                            Mensagem
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <h3 className="text-lg font-medium">Receitas Expiradas</h3>
                          </CardHeader>
                          <CardContent>
                            {receitasExpiradas.length === 0 ? (
                              <p className="text-gray-500 text-center py-4">Nenhuma receita expirada.</p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Médico</TableHead>
                                    <TableHead>Medicamentos</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {receitasExpiradas.map(receita => (
                                    <TableRow key={receita.id} className="opacity-70">
                                      <TableCell>{format(receita.data, "dd/MM/yyyy")}</TableCell>
                                      <TableCell>
                                        <Link to={`/medico/${receita.medicoId}`} className="hover:text-hopecann-teal">
                                          {receita.medico}
                                        </Link>
                                        <div className="text-xs text-gray-500">{receita.especialidade}</div>
                                      </TableCell>
                                      <TableCell>
                                        <ul className="list-disc pl-5">
                                          {receita.medicamentos.map((med, index) => (
                                            <li key={index} className="text-sm">
                                              {med.nome} - {med.dosagem}
                                            </li>
                                          ))}
                                        </ul>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button variant="outline" size="sm">
                                          <FileUp size={16} className="mr-1" />
                                          Ver PDF
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Dialog de confirmação de cancelamento */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Consulta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar esta consulta? Esta ação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {consultaSelecionada && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium">{consultaSelecionada.medico}</p>
                <p className="text-sm text-gray-600">{consultaSelecionada.especialidade}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {format(consultaSelecionada.data, "dd/MM/yyyy")} às {consultaSelecionada.horario}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={loading}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelarConsulta}
              disabled={loading}
            >
              {loading ? "Processando..." : "Confirmar Cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AreaPaciente;
