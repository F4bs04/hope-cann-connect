import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Calendar, MapPin, Phone, Mail, Clock, Flag, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { calculateAvailability } from "@/utils/doctorUtils";
import { fetchDoctorById } from "@/utils/doctorDataUtils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface Mensagem {
  id: number;
  texto: string;
  data: Date;
  remetente: 'medico' | 'paciente';
}

interface Medico {
  id: number;
  nome: string;
  especialidade: string;
  foto: string;
  bio: string;
  credenciais: string[];
  citacao: string;
  estado: string;
  disponibilidade: string[];
  telefone: string;
  email: string;
  avaliacao: number;
  endereco: string;
  horarios: string[];
}

const PerfilMedico = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<string>('sobre');
  const [medico, setMedico] = useState<Medico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  useEffect(() => {
    if (!id) {
      setError("ID do médico não fornecido");
      setLoading(false);
      return;
    }
    
    const fetchMedico = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchDoctorById(id);
        
        if (data) {
          const { data: appointmentData, error: appointmentError } = await supabase
            .from('consultas')
            .select('data_hora')
            .eq('id_medico', data.id)
            .eq('status', 'agendada')
            .gte('data_hora', new Date().toISOString())
            .order('data_hora', { ascending: true })
            .limit(1);
          
          if (appointmentError) {
            console.error('Error fetching appointments:', appointmentError);
          }
          
          let appointmentDate = null;
          if (appointmentData && appointmentData.length > 0) {
            appointmentDate = new Date(appointmentData[0].data_hora);
          }
          
          const disponibilidade = calculateAvailability(appointmentDate);
          
          const medicoData: Medico = {
            id: data.id,
            nome: data.nome,
            especialidade: data.especialidade,
            foto: data.foto_perfil || `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`,
            bio: data.biografia || 'Especialista em tratamentos canábicos.',
            credenciais: [
              "Membro da Sociedade Brasileira de " + data.especialidade,
              "Especialização em Cannabis Medicinal",
              "Experiência em tratamentos inovadores"
            ],
            citacao: "Acredito no poder da medicina canábica como uma alternativa eficaz para pacientes que não respondem aos tratamentos convencionais.",
            estado: "SP",
            disponibilidade,
            telefone: data.telefone || "+55 (11) 99999-9999",
            email: "dr." + data.nome.toLowerCase().replace(' ', '.') + "@hopecann.com.br",
            avaliacao: 4.8,
            endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
            horarios: ["Segunda a Sexta: 08:00 - 18:00", "Sábados: 08:00 - 12:00"]
          };
          
          setMedico(medicoData);
        } else {
          const medicoId = parseInt(id);
          
          if (medicoId && (medicoId === 1 || medicoId === 2 || medicoId === 3)) {
            const medicoData: Medico = {
              id: medicoId,
              nome: medicoId === 1 ? "Dr. Ricardo Silva" : medicoId === 2 ? "Dra. Ana Santos" : "Dr. Carlos Mendes",
              especialidade: medicoId === 2 ? "Psiquiatra" : "Neurologista",
              foto: medicoId === 1 
                ? "/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png"
                : medicoId === 2 
                  ? "/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png" 
                  : "/lovable-uploads/8e0e4c0d-f012-449c-9784-9be7170458f5.png",
              bio: medicoId === 2 
                ? "Especializada em tratamentos para ansiedade e depressão com abordagem integrativa. Formada pela UFRJ com residência em Psiquiatria pelo Instituto de Psiquiatria da USP." 
                : "Especialista em epilepsia e doenças neurodegenerativas, com foco em tratamentos inovadores. Formado pela UNICAMP com doutorado em Neurologia Clínica.",
              credenciais: medicoId === 2 
                ? [
                    "Membro da Associação Brasileira de Psiquiatria",
                    "Mestrado em Neurociências",
                    "Especialização em Cannabis Medicinal para Transtornos Mentais"
                  ] 
                : [
                    "Membro da Academia Brasileira de Neurologia",
                    "Pesquisador clínico em canabinoides para doenças neurológicas",
                    "Coordenador do Centro de Tratamento Avançado em Epilepsia"
                  ],
              citacao: medicoId === 2 
                ? "Minha abordagem combina a psiquiatria tradicional com os avanços da medicina canábica, buscando sempre o melhor resultado para cada paciente." 
                : "Vejo diariamente como o tratamento canábico pode transformar a vida de pacientes com condições neurológicas complexas.",
              estado: medicoId === 2 ? "RJ" : "SP",
              disponibilidade: medicoId === 2 ? ["this-week", "next-week"] : ["next-week"],
              telefone: "+55 (11) 99999-9999",
              email: medicoId === 2 ? "dra.ana.santos@hopecann.com.br" : "dr.carlos.mendes@hopecann.com.br",
              avaliacao: medicoId === 2 ? 4.9 : 4.7,
              endereco: medicoId === 2 ? "Av. Rio Branco, 156 - Centro, Rio de Janeiro - RJ" : "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
              horarios: ["Segunda a Sexta: 08:00 - 18:00", "Sábados: 08:00 - 12:00"]
            };
            
            setMedico(medicoData);
          } else {
            setError("Médico não encontrado");
          }
        }
        
        if (!error) {
          const historicoDeMensagens: Mensagem[] = [
            {
              id: 1,
              texto: `Olá! Como posso ajudar você hoje?`,
              data: new Date(2025, 3, 5, 14, 30),
              remetente: 'medico'
            },
            {
              id: 2,
              texto: "Boa tarde! Gostaria de tirar algumas dúvidas sobre o medicamento que me receitou na última consulta.",
              data: new Date(2025, 3, 5, 14, 32),
              remetente: 'paciente'
            },
            {
              id: 3,
              texto: "Claro, estou à disposição. Quais são suas dúvidas?",
              data: new Date(2025, 3, 5, 14, 35),
              remetente: 'medico'
            }
          ];
          
          setMensagens(historicoDeMensagens);
        }
      } catch (error) {
        console.error('Error in fetchMedico:', error);
        setError("Erro ao carregar dados do médico");
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações do médico. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMedico();
  }, [id, toast]);

  function handleEnviarMensagem() {
    if (!novaMensagem.trim()) return;
    
    const novaMensagemObj: Mensagem = {
      id: mensagens.length + 1,
      texto: novaMensagem,
      data: new Date(),
      remetente: 'paciente'
    };
    
    setMensagens([...mensagens, novaMensagemObj]);
    setNovaMensagem('');
    
    setTimeout(() => {
      const respostaMedico: Mensagem = {
        id: mensagens.length + 2,
        texto: "Obrigado pela sua mensagem. Responderei o mais breve possível.",
        data: new Date(),
        remetente: 'medico'
      };
      
      setMensagens(prev => [...prev, respostaMedico]);
    }, 1000);
  }

  function handleEnviarReporte() {
    if (!reportReason || !reportDescription) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Reporte enviado",
      description: "Sua denúncia foi enviada com sucesso e será analisada pela nossa equipe.",
    });
    
    setShowReportDialog(false);
    setReportReason('');
    setReportDescription('');
  }

  function handleAgendarConsulta() {
    navigate('/agendar', { state: { medicoId: id } });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-12 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-hopecann-teal mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando informações do médico...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !medico) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-12 bg-gray-50">
          <div className="hopecann-container text-center">
            <h1 className="text-2xl font-bold mb-4">Médico não encontrado</h1>
            <p className="text-gray-600 mb-8">O médico que você está procurando não foi encontrado.</p>
            <Alert variant="destructive" className="mx-auto max-w-md mb-8">
              <AlertTitle>Erro ao carregar dados</AlertTitle>
              <AlertDescription>
                Não foi possível carregar as informações do médico. Por favor, tente novamente mais tarde.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/medicos')}>
              Ver todos os médicos
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="hopecann-container">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-8 md:flex">
              <div className="md:w-1/3 flex justify-center md:justify-start mb-6 md:mb-0">
                <Avatar className="h-64 w-64 border-4 border-white shadow-lg">
                  <AvatarImage src={medico.foto} alt={medico.nome} />
                  <AvatarFallback>{medico.nome.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="md:w-2/3 md:pl-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{medico.nome}</h1>
                    <p className="text-hopecann-teal text-xl">{medico.especialidade}</p>
                  </div>
                  
                  <div className="flex items-center mt-2 md:mt-0">
                    <div className="flex items-center mr-4">
                      <Star className="text-yellow-400 mr-1" fill="currentColor" size={20} />
                      <span className="font-semibold">{medico.avaliacao}</span>
                    </div>
                    
                    <Button 
                      className="bg-hopecann-teal hover:bg-hopecann-teal/90 flex items-center"
                      onClick={handleAgendarConsulta}
                    >
                      <Calendar size={18} className="mr-2" />
                      Agendar Consulta
                    </Button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <MapPin size={18} className="mr-2 text-gray-400" />
                    <span>{medico.endereco}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Mail size={18} className="mr-2 text-gray-400" />
                    <span>{medico.email}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Phone size={18} className="mr-2 text-gray-400" />
                    <span>{medico.telefone}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock size={18} className="mr-2 text-gray-400" />
                    <span>{medico.horarios[0]}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500"
                    onClick={() => setShowReportDialog(true)}
                  >
                    <Flag size={16} className="mr-2" />
                    Reportar Problema
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
              <TabsTrigger value="sobre">Sobre o Médico</TabsTrigger>
              <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sobre" className="mt-6">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Biografia</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{medico.bio}</p>
                      
                      <blockquote className="border-l-4 border-hopecann-teal pl-4 my-6 italic text-gray-600">
                        {medico.citacao}
                      </blockquote>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Credenciais e Especializações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2">
                        {medico.credenciais.map((credencial, index) => (
                          <li key={index} className="text-gray-700">{credencial}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Horários</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {medico.horarios.map((horario, index) => (
                          <div key={index} className="flex items-center">
                            <Clock size={16} className="mr-2 text-gray-400" />
                            <span className="text-gray-700">{horario}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-hopecann-teal hover:bg-hopecann-teal/90"
                        onClick={handleAgendarConsulta}
                      >
                        <Calendar size={16} className="mr-2" />
                        Agendar Consulta
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mensagens" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageIcon className="mr-2" />
                    Mensagens com {medico.nome}
                  </CardTitle>
                  <CardDescription>
                    Envie mensagens para o médico sobre suas dúvidas, receitas ou tratamentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md h-96 flex flex-col">
                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                      {mensagens.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          <p>Nenhuma mensagem ainda. Envie uma mensagem para iniciar a conversa.</p>
                        </div>
                      ) : (
                        mensagens.map((mensagem) => (
                          <div 
                            key={mensagem.id} 
                            className={`flex ${mensagem.remetente === 'paciente' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] p-3 rounded-lg ${
                                mensagem.remetente === 'paciente' 
                                  ? 'bg-hopecann-teal text-white rounded-tr-none' 
                                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
                              }`}
                            >
                              <p>{mensagem.texto}</p>
                              <div 
                                className={`text-xs mt-1 ${
                                  mensagem.remetente === 'paciente' ? 'text-white/80' : 'text-gray-500'
                                }`}
                              >
                                {format(mensagem.data, "HH:mm - dd/MM/yyyy")}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Textarea 
                          placeholder="Digite sua mensagem..." 
                          className="resize-none"
                          value={novaMensagem}
                          onChange={(e) => setNovaMensagem(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleEnviarMensagem();
                            }
                          }}
                        />
                        <Button 
                          className="bg-hopecann-teal hover:bg-hopecann-teal/90"
                          onClick={handleEnviarMensagem}
                        >
                          <Send size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar Problema</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo da sua denúncia. Sua identidade será mantida em sigilo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Motivo da denúncia
              </label>
              <select 
                id="reason"
                className="w-full p-2 border rounded-md"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="">Selecione um motivo</option>
                <option value="conduta-inadequada">Conduta inadequada</option>
                <option value="informacoes-incorretas">Informações incorretas</option>
                <option value="propaganda-enganosa">Propaganda enganosa</option>
                <option value="conteudo-impróprio">Conteúdo impróprio</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição detalhada
              </label>
              <Textarea 
                id="description"
                placeholder="Descreva o problema em detalhes..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleEnviarReporte}
            >
              Enviar Denúncia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const MessageIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default PerfilMedico;
