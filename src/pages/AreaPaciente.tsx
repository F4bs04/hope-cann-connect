
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, FileText, CalendarCheck, X, PenSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

// Tipo para as consultas
interface Consulta {
  id: number;
  medico: string;
  especialidade: string;
  data: Date;
  horario: string;
  tipo: string;
  status: "agendada" | "concluida" | "cancelada";
}

const AreaPaciente = () => {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
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
        especialidade: "Psiquiatra",
        data: new Date(2025, 3, 15), // 15/04/2025
        horario: "14:00",
        tipo: "Primeira Consulta",
        status: "agendada"
      },
      {
        id: 2,
        medico: "Dr. Carlos Mendes",
        especialidade: "Neurologista",
        data: new Date(2025, 3, 22), // 22/04/2025
        horario: "10:00",
        tipo: "Primeira Consulta",
        status: "agendada"
      },
      {
        id: 3,
        medico: "Dra. Ana Santos",
        especialidade: "Psiquiatra",
        data: new Date(2025, 2, 10), // 10/03/2025 (já passou)
        horario: "15:00",
        tipo: "Primeira Consulta",
        status: "concluida"
      }
    ];
    
    setConsultas(mockConsultas);
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

  if (!isAuthenticated) {
    return null; // Página será redirecionada no useEffect
  }

  const consultasAgendadas = consultas.filter(c => c.status === "agendada");
  const consultasConcluidas = consultas.filter(c => c.status === "concluida");
  const consultasCanceladas = consultas.filter(c => c.status === "cancelada");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="hopecann-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Área do Paciente</h1>
            <Button variant="outline" onClick={handleLogout}>Sair</Button>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4">Bem-vindo(a), {localStorage.getItem('userEmail')}</h2>
            <p className="text-gray-600">
              Aqui você pode gerenciar suas consultas médicas, ver seu histórico e reagendar quando necessário.
            </p>
          </div>
          
          <Tabs defaultValue="agendadas" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="agendadas" className="text-sm md:text-base">
                Agendadas ({consultasAgendadas.length})
              </TabsTrigger>
              <TabsTrigger value="concluidas" className="text-sm md:text-base">
                Concluídas ({consultasConcluidas.length})
              </TabsTrigger>
              <TabsTrigger value="canceladas" className="text-sm md:text-base">
                Canceladas ({consultasCanceladas.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="agendadas">
              {consultasAgendadas.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <CalendarCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma consulta agendada</h3>
                  <p className="text-gray-500 mb-4">Você não possui consultas agendadas no momento.</p>
                  <Button 
                    onClick={() => navigate('/agendar')}
                    className="bg-hopecann-teal hover:bg-hopecann-teal/90"
                  >
                    Agendar Nova Consulta
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultasAgendadas.map((consulta) => (
                    <div key={consulta.id} className="border rounded-lg p-4 hover:border-hopecann-teal/50 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{consulta.medico}</h3>
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
                          <h3 className="font-semibold text-lg">{consulta.medico}</h3>
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
                        
                        <div className="mt-4 md:mt-0">
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
            
            <TabsContent value="canceladas">
              {consultasCanceladas.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">Nenhuma consulta cancelada</h3>
                  <p className="text-gray-500">Consultas canceladas aparecerão aqui.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultasCanceladas.map((consulta) => (
                    <div key={consulta.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{consulta.medico}</h3>
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
                        
                        <div className="mt-4 md:mt-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Cancelada
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
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
