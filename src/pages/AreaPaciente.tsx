
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PacienteProfileCard from '@/components/paciente/PacienteProfileCard';
import ConsultasPaciente from '@/components/paciente/ConsultasPaciente';
import ReceitasPaciente from '@/components/paciente/ReceitasPaciente';
import HistoricoPaciente from '@/components/paciente/HistoricoPaciente';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardList, FileText, MessageSquare, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PacienteForm from '@/components/forms/PacienteForm';
import { getPacienteById, updatePaciente } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';

import ChatsPacienteList from "@/components/paciente/ChatsList";
import ChatPaciente from "@/components/paciente/ChatPaciente";
import PacienteSaldoCard from '@/components/paciente/PacienteSaldoCard';

interface LocationState {
  activeTab?: string;
  medicoId?: number;
}

const AreaPaciente = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState | null;
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paciente, setPaciente] = useState<any | null>(null);
  const [pacienteId, setPacienteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<string>('consultas');
  const [selectedChat, setSelectedChat] = useState<any>(null);
  
  // Verificar dados do usuário logado
  useEffect(() => {
    const checkUserSession = async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session || !session.session) {
        toast({
          title: "Acesso não autorizado",
          description: "Por favor, faça login para acessar esta página.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }
      
      // Obter ID do paciente com base no e-mail do usuário
      try {
        const { data: pacienteData, error } = await supabase
          .from('pacientes_app')
          .select('*')
          .eq('email', session.session.user.email)
          .single();
        
        if (error || !pacienteData) {
          console.error("Erro ao buscar paciente:", error);
          toast({
            title: "Usuário não encontrado",
            description: "Não foi possível encontrar suas informações de paciente.",
            variant: "destructive"
          });
          return;
        }
        
        setPacienteId(pacienteData.id);
        setPaciente(pacienteData);
      } catch (error) {
        console.error("Erro ao buscar dados do paciente:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserSession();
    
    // Verificar se há um medicoId no state para abrir o chat diretamente
    if (locationState && locationState.activeTab) {
      setActiveTab(locationState.activeTab);
      
      if (locationState.activeTab === 'chat' && locationState.medicoId) {
        // Aqui você poderia carregar o chat com esse médico
        console.log('Abrir chat com médico:', locationState.medicoId);
      }
    }
  }, []);

  const handleEditarPaciente = () => {
    setIsDialogOpen(true);
  };

  const handleSalvarPaciente = async (data: any) => {
    if (!pacienteId) return;
    
    try {
      const atualizado = await updatePaciente(pacienteId, data);
      
      if (atualizado) {
        setPaciente(atualizado);
        toast({
          title: "Perfil atualizado",
          description: "As informações do seu perfil foram atualizadas com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar suas informações.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao salvar suas informações.",
        variant: "destructive"
      });
    }
    
    setIsDialogOpen(false);
  };

  const handleAgendarConsulta = () => {
    navigate('/agendar');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 bg-gray-50 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8 bg-gray-50">
        <div className="hopecann-container">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <div className="sticky top-8">
                <PacienteProfileCard 
                  nome={paciente?.nome || "Carregando..."}
                  email={paciente?.email || ""}
                  genero={paciente?.genero}
                  dataNascimento={paciente?.data_nascimento}
                  fotoUrl={paciente?.foto_url}
                  onEditar={handleEditarPaciente}
                />
                
                <div className="mt-4 px-4 py-3 bg-white rounded-lg shadow border border-gray-100">
                  <PacienteSaldoCard pacienteId={pacienteId || 0} />
                </div>
                
                <div className="mt-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Menu</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-1.5">
                        <Button 
                          variant={activeTab === 'consultas' ? 'default' : 'ghost'} 
                          className="w-full justify-start"
                          onClick={() => setActiveTab('consultas')}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Consultas
                        </Button>
                        <Button 
                          variant={activeTab === 'receitas' ? 'default' : 'ghost'} 
                          className="w-full justify-start"
                          onClick={() => setActiveTab('receitas')}
                        >
                          <ClipboardList className="h-4 w-4 mr-2" />
                          Receitas
                        </Button>
                        <Button 
                          variant={activeTab === 'historico' ? 'default' : 'ghost'} 
                          className="w-full justify-start"
                          onClick={() => setActiveTab('historico')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Histórico Médico
                        </Button>
                        <Button 
                          variant={activeTab === 'chat' ? 'default' : 'ghost'} 
                          className="w-full justify-start"
                          onClick={() => {
                            setActiveTab('chat');
                            setSelectedChat(null);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat com Médicos
                        </Button>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <Button 
                          onClick={handleAgendarConsulta}
                          className="w-full bg-hopecann-teal hover:bg-hopecann-teal/90"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Agendar Nova Consulta
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            
            <div className="lg:w-2/3">
              {activeTab === 'consultas' && (
                <div className="space-y-6">
                  <ConsultasPaciente pacienteId={pacienteId || 0} />
                </div>
              )}
              
              {activeTab === 'receitas' && (
                <div className="space-y-6">
                  <ReceitasPaciente pacienteId={pacienteId || 0} />
                </div>
              )}
              
              {activeTab === 'historico' && (
                <div className="space-y-6">
                  <HistoricoPaciente pacienteId={pacienteId || 0} />
                </div>
              )}
              
              {activeTab === 'chat' && (
                <div>
                  {selectedChat ? (
                    <ChatPaciente
                      medicoId={selectedChat.medicos.id}
                      pacienteId={pacienteId || 0}
                      medicoNome={selectedChat.medicos.nome}
                      medicoEspecialidade={selectedChat.medicos.especialidade}
                      medicoFoto={selectedChat.medicos.foto_perfil}
                      onBack={() => setSelectedChat(null)}
                    />
                  ) : (
                    <ChatsPacienteList
                      pacienteId={pacienteId || 0}
                      onSelectChat={setSelectedChat}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize as informações do seu perfil.
            </DialogDescription>
          </DialogHeader>
          <PacienteForm 
            initialData={paciente}
            onSubmit={handleSalvarPaciente}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AreaPaciente;
