import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Search, Phone, Video, MoreVertical, Paperclip, Image, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
  sender_avatar?: string;
}

interface PatientInfo {
  id: number;
  nome: string;
  avatar_url?: string;
  ultima_mensagem?: string;
  data_ultima_mensagem?: string;
  mensagens_nao_lidas?: number;
}

const ChatMedico: React.FC = () => {
  const { toast } = useToast();
  const [medicoId, setMedicoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientInfo[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [databaseError, setDatabaseError] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const getUserId = async () => {
      const email = localStorage.getItem('userEmail');
      if (email) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', email)
          .maybeSingle();
          
        if (data?.id) {
          setMedicoId(data.id);
          try {
            await fetchPatients(data.id);
          } catch (error) {
            console.error('Erro ao carregar pacientes:', error);
            setDatabaseError(true);
          }
        }
      }
    };
    
    getUserId();
  }, []);

  useEffect(() => {
    if (medicoId && selectedPatient) {
      fetchMessages(medicoId, selectedPatient.id);
      
      // Subscribe to new messages
      const subscription = supabase
        .channel('chat_messages')
        .on('postgres_changes', {
          event: 'INSERT', 
          schema: 'public',
          table: 'mensagens',
          filter: `receiver_id=eq.${medicoId}`,
        }, (payload) => {
          const newMsg = payload.new as ChatMessage;
          if (newMsg.sender_id === selectedPatient.id) {
            setMessages(prev => [...prev, newMsg]);
            markMessageAsRead(newMsg.id);
          } else {
            // Update the badge count for other patients
            fetchPatients(medicoId);
          }
        })
        .subscribe();
        
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [medicoId, selectedPatient]);

  useEffect(() => {
    // Filter patients based on search query
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        patient.nome.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchPatients = async (doctorId: number) => {
    setLoading(true);
    try {
      // Fetch patients linked to this doctor
      const { data: patientLinks, error } = await supabase
        .from('vinculo_medico_paciente')
        .select('paciente_id')
        .eq('medico_id', doctorId);
        
      if (error) {
        // Se a tabela não existir, ativar o modo de demonstração
        if (error.code === '42P01') {
          setDatabaseError(true);
          loadDemoData();
          return;
        }
        throw error;
      }
      
      if (patientLinks && patientLinks.length > 0) {
        const patientIds = patientLinks.map(link => link.paciente_id);
        
        // Fetch patient details
        const { data: patientData, error: patientError } = await supabase
          .from('pacientes_app')
          .select('id, nome, avatar_url')
          .in('id', patientIds);
          
        if (patientError) throw patientError;
        
        // Get the latest message and unread count for each patient
        const patientsWithChat = await Promise.all(patientData.map(async (patient) => {
          // Get latest message
          const { data: latestMsg, error: msgError } = await supabase
            .from('mensagens')
            .select('content, created_at')
            .or(`sender_id.eq.${patient.id},receiver_id.eq.${patient.id}`)
            .or(`sender_id.eq.${doctorId},receiver_id.eq.${doctorId}`)
            .order('created_at', { ascending: false })
            .limit(1);
            
          // Get unread count
          const { count, error: countError } = await supabase
            .from('mensagens')
            .select('id', { count: 'exact', head: true })
            .eq('receiver_id', doctorId)
            .eq('sender_id', patient.id)
            .eq('is_read', false);
            
          return {
            ...patient,
            ultima_mensagem: latestMsg && latestMsg[0] ? latestMsg[0].content : undefined,
            data_ultima_mensagem: latestMsg && latestMsg[0] ? latestMsg[0].created_at : undefined,
            mensagens_nao_lidas: count || 0
          };
        }));
        
        // Sort by latest message date
        patientsWithChat.sort((a, b) => {
          if (!a.data_ultima_mensagem) return 1;
          if (!b.data_ultima_mensagem) return -1;
          return new Date(b.data_ultima_mensagem).getTime() - new Date(a.data_ultima_mensagem).getTime();
        });
        
        setPatients(patientsWithChat);
        setFilteredPatients(patientsWithChat);
      } else {
        // Se não tiver pacientes vinculados, carregar dados de demonstração
        loadDemoData();
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      setDatabaseError(true);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };
  
  const loadDemoData = () => {
    setDemoMode(true);
    // Dados fictícios de pacientes para demonstração
    const demoPacientes: PatientInfo[] = [
      {
        id: 1,
        nome: 'Maria Silva',
        avatar_url: 'https://i.pravatar.cc/150?img=1',
        ultima_mensagem: 'Olá doutor, como está?',
        data_ultima_mensagem: new Date().toISOString(),
        mensagens_nao_lidas: 2
      },
      {
        id: 2,
        nome: 'João Ferreira',
        avatar_url: 'https://i.pravatar.cc/150?img=3',
        ultima_mensagem: 'Obrigado pela consulta de ontem',
        data_ultima_mensagem: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        mensagens_nao_lidas: 0
      },
      {
        id: 3,
        nome: 'Ana Beatriz',
        avatar_url: 'https://i.pravatar.cc/150?img=5',
        ultima_mensagem: 'Preciso remarcar minha consulta',
        data_ultima_mensagem: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        mensagens_nao_lidas: 0
      }
    ];
    
    setPatients(demoPacientes);
    setFilteredPatients(demoPacientes);
  };

  const fetchMessages = async (doctorId: number, patientId: number) => {
    setMessagesLoading(true);
    try {
      // No modo de demonstração, carregamos mensagens fictícias
      if (demoMode) {
        loadDemoMessages(patientId);
        setMessagesLoading(false);
        return;
      }
      
      // Fetch messages between doctor and patient
      const { data, error } = await supabase
        .from('mensagens')
        .select(`
          id,
          sender_id,
          receiver_id,
          content,
          created_at,
          is_read
        `)
        .or(`and(sender_id.eq.${doctorId},receiver_id.eq.${patientId}),and(sender_id.eq.${patientId},receiver_id.eq.${doctorId})`)
        .order('created_at', { ascending: true });
        
      if (error) {
        if (error.code === '42P01') {
          // Se a tabela não existir, ativar o modo de demonstração
          setDatabaseError(true);
          loadDemoMessages(patientId);
          return;
        }
        throw error;
      }
      
      if (data) {
        setMessages(data);
        
        // Mark unread messages as read
        const unreadMessages = data
          .filter(msg => msg.receiver_id === doctorId && !msg.is_read)
          .map(msg => msg.id);
          
        if (unreadMessages.length > 0) {
          await markMessagesAsRead(unreadMessages);
          // Update patient list to refresh unread counts
          fetchPatients(doctorId);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      // Ativar o modo de demonstração em caso de erro
      setDatabaseError(true);
      loadDemoMessages(patientId);
    } finally {
      setMessagesLoading(false);
    }
  };
  
  const loadDemoMessages = (patientId: number) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    // Mensagens fictícias baseadas no paciente selecionado
    let demoMessages: ChatMessage[] = [];
    
    if (patientId === 1) {
      // Mensagens para Maria Silva
      demoMessages = [
        {
          id: 101,
          sender_id: 1,
          receiver_id: medicoId || 99,
          content: 'Olá doutor, como está?',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 102,
          sender_id: medicoId || 99,
          receiver_id: 1,
          content: 'Olá Maria! Estou bem, como posso ajudá-la?',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 103,
          sender_id: 1,
          receiver_id: medicoId || 99,
          content: 'Estou sentindo algumas dores nas articulações nos últimos dias',
          created_at: yesterday.toISOString(),
          is_read: true
        },
        {
          id: 104,
          sender_id: medicoId || 99,
          receiver_id: 1,
          content: 'Há quanto tempo está sentindo essas dores? Está tomando alguma medicação?',
          created_at: yesterday.toISOString(),
          is_read: true
        },
        {
          id: 105,
          sender_id: 1,
          receiver_id: medicoId || 99,
          content: 'Começou há uns 3 dias. Estou tomando apenas o óleo que você receitou.',
          created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          is_read: true
        },
        {
          id: 106,
          sender_id: 1,
          receiver_id: medicoId || 99,
          content: 'Posso marcar uma consulta para esta semana?',
          created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          is_read: false
        },
      ];
    } else if (patientId === 2) {
      // Mensagens para João Ferreira
      demoMessages = [
        {
          id: 201,
          sender_id: 2,
          receiver_id: medicoId || 99,
          content: 'Bom dia doutor!',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 202,
          sender_id: medicoId || 99,
          receiver_id: 2,
          content: 'Bom dia João, como está se sentindo após a consulta?',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 203,
          sender_id: 2,
          receiver_id: medicoId || 99,
          content: 'Estou me sentindo muito melhor, obrigado pela consulta de ontem',
          created_at: yesterday.toISOString(),
          is_read: true
        },
        {
          id: 204,
          sender_id: medicoId || 99,
          receiver_id: 2,
          content: 'Ótimo! Continue com a medicação conforme prescrito e me avise se tiver alguma dúvida.',
          created_at: yesterday.toISOString(),
          is_read: true
        },
      ];
    } else if (patientId === 3) {
      // Mensagens para Ana Beatriz
      demoMessages = [
        {
          id: 301,
          sender_id: 3,
          receiver_id: medicoId || 99,
          content: 'Olá Dr., tudo bem?',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 302,
          sender_id: medicoId || 99,
          receiver_id: 3,
          content: 'Olá Ana, tudo bem e você?',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 303,
          sender_id: 3,
          receiver_id: medicoId || 99,
          content: 'Preciso remarcar minha consulta da próxima semana. Teria como mudar para a semana seguinte?',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 304,
          sender_id: medicoId || 99,
          receiver_id: 3,
          content: 'Claro, vou verificar as datas disponíveis e te aviso ainda hoje.',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
      ];
    }
    
    setMessages(demoMessages);
  };

  const markMessagesAsRead = async (messageIds: number[]) => {
    try {
      const { error } = await supabase
        .from('mensagens')
        .update({ is_read: true })
        .in('id', messageIds);
        
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

  const markMessageAsRead = async (messageId: number) => {
    try {
      const { error } = await supabase
        .from('mensagens')
        .update({ is_read: true })
        .eq('id', messageId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !medicoId || !selectedPatient) return;
    
    // No modo de demonstração, simplesmente adicionamos a mensagem à lista local
    if (demoMode || databaseError) {
      const newMsg: ChatMessage = {
        id: Math.floor(Math.random() * 10000),
        sender_id: medicoId,
        receiver_id: selectedPatient.id,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        is_read: false
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Atualizar a última mensagem do paciente na lista
      const updatedPatients = patients.map(patient => {
        if (patient.id === selectedPatient.id) {
          return {
            ...patient,
            ultima_mensagem: newMessage.trim(),
            data_ultima_mensagem: new Date().toISOString()
          };
        }
        return patient;
      });
      
      setPatients(updatedPatients);
      setFilteredPatients(updatedPatients.filter(patient => 
        patient.nome.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .insert([
          {
            sender_id: medicoId,
            receiver_id: selectedPatient.id,
            content: newMessage.trim(),
            created_at: new Date().toISOString(),
            is_read: false
          }
        ])
        .select();
        
      if (error) throw error;
      
      if (data) {
        setMessages(prev => [...prev, data[0]]);
        setNewMessage('');
        
        // Update patient list to show latest message
        fetchPatients(medicoId);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente."
      });
      
      // Fallback para modo de demonstração em caso de erro
      setDatabaseError(true);
      setDemoMode(true);
      sendMessage(); // Tenta novamente no modo de demonstração
    }
  };

  const handlePatientSelect = (patient: PatientInfo) => {
    setSelectedPatient(patient);
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return format(date, "'Hoje,' HH:mm", { locale: ptBR });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return format(date, "'Ontem,' HH:mm", { locale: ptBR });
    } else {
      return format(date, "dd/MM/yyyy, HH:mm", { locale: ptBR });
    }
  };

  const formatPreviewDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return format(date, "HH:mm", { locale: ptBR });
    } else {
      return format(date, "dd/MM", { locale: ptBR });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold mb-2">Chat com Pacientes</h1>
      <p className="text-gray-600 mb-6">
        Converse com seus pacientes diretamente pela plataforma
      </p>
      
      {databaseError && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Modo de demonstração ativado</AlertTitle>
          <AlertDescription className="text-yellow-700">
            As tabelas necessárias para o chat não foram encontradas no banco de dados.
            Os dados mostrados são apenas para demonstração. Consulte o arquivo <code>src/scripts/setup-chat-tables.sql</code> para configurar o banco de dados.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex-1 flex border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Left sidebar with patient list */}
        <div className="w-1/3 border-r bg-gray-50 flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar paciente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin h-5 w-5 border-2 border-[#00B3B0] rounded-full border-t-transparent" />
              </div>
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map(patient => (
                <div
                  key={patient.id}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-100 transition-colors ${selectedPatient?.id === patient.id ? 'bg-gray-100' : ''}`}
                  onClick={() => handlePatientSelect(patient)}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={patient.avatar_url} alt={patient.nome} />
                        <AvatarFallback>{patient.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {patient.mensagens_nao_lidas && patient.mensagens_nao_lidas > 0 && (
                        <div className="absolute -top-1 -right-1 bg-[#00B3B0] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {patient.mensagens_nao_lidas}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{patient.nome}</span>
                        {patient.data_ultima_mensagem && (
                          <span className="text-xs text-gray-500">{formatPreviewDate(patient.data_ultima_mensagem)}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {patient.ultima_mensagem || 'Iniciar conversa...'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'Nenhum paciente encontrado' : 'Nenhum paciente disponível'}
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Right side with chat messages */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedPatient ? (
            <>
              {/* Chat header */}
              <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedPatient.avatar_url} alt={selectedPatient.nome} />
                    <AvatarFallback>{selectedPatient.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <div className="font-medium">{selectedPatient.nome}</div>
                    <div className="text-xs text-gray-500">Paciente</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Phone className="h-5 w-5 text-gray-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Video className="h-5 w-5 text-gray-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <MoreVertical className="h-5 w-5 text-gray-600" />
                  </Button>
                </div>
              </div>
              
              {/* Messages area */}
              <ScrollArea className="flex-1 p-4 bg-[#f5f5f5]">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin h-5 w-5 border-2 border-[#00B3B0] rounded-full border-t-transparent" />
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isMyMessage = message.sender_id === medicoId;
                      const showDate = index === 0 || 
                        new Date(messages[index-1].created_at).toDateString() !== new Date(message.created_at).toDateString();
                      
                      return (
                        <React.Fragment key={message.id}>
                          {showDate && (
                            <div className="text-center my-4">
                              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                                {format(new Date(message.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                            <div 
                              className={`max-w-[70%] p-3 rounded-lg ${
                                isMyMessage 
                                  ? 'bg-[#DCF8C6] text-gray-800 rounded-tr-none' 
                                  : 'bg-white text-gray-800 rounded-tl-none'
                              }`}
                            >
                              <p className="mb-1">{message.content}</p>
                              <div className="text-right">
                                <span className="text-xs text-gray-500">
                                  {formatMessageDate(message.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <p>Nenhuma mensagem para exibir.</p>
                    <p className="text-sm">Comece a conversar com {selectedPatient.nome}!</p>
                  </div>
                )}
              </ScrollArea>
              
              {/* Message input */}
              <div className="p-3 border-t bg-white">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Image className="h-5 w-5 text-gray-500" />
                  </Button>
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim()}
                    className="bg-[#00B3B0] hover:bg-[#009E9B] text-white"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <div className="mb-4">
                <Message className="h-16 w-16 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nenhuma conversa selecionada</h3>
              <p>Selecione um paciente para iniciar uma conversa.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Additional icon not imported at the top
const Message = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
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
};

export default ChatMedico;
