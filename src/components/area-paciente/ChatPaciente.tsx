import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

interface DoctorInfo {
  id: number;
  nome: string;
  especialidade?: string;
  avatar_url?: string;
  ultima_mensagem?: string;
  data_ultima_mensagem?: string;
  mensagens_nao_lidas?: number;
}

const ChatPaciente: React.FC = () => {
  const { toast } = useToast();
  const [pacienteId, setPacienteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorInfo[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showRequestChat, setShowRequestChat] = useState(false);
  const [databaseError, setDatabaseError] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const getUserId = async () => {
      const email = localStorage.getItem('userEmail');
      if (email) {
        const { data, error } = await supabase
          .from('pacientes_app')
          .select('id')
          .eq('email', email)
          .maybeSingle();
          
        if (data?.id) {
          setPacienteId(data.id);
          try {
            await fetchDoctors(data.id);
          } catch (error) {
            console.error('Erro ao carregar médicos:', error);
            setDatabaseError(true);
            setDemoMode(true);
            loadDemoData();
          }
        }
      }
    };
    
    getUserId();
  }, []);

  useEffect(() => {
    if (pacienteId && selectedDoctor) {
      fetchMessages(pacienteId, selectedDoctor.id);
      
      // Subscribe to new messages
      const subscription = supabase
        .channel('chat_messages')
        .on('postgres_changes', {
          event: 'INSERT', 
          schema: 'public',
          table: 'mensagens',
          filter: `receiver_id=eq.${pacienteId}`,
        }, (payload) => {
          const newMsg = payload.new as ChatMessage;
          if (newMsg.sender_id === selectedDoctor.id) {
            setMessages(prev => [...prev, newMsg]);
            markMessageAsRead(newMsg.id);
          } else {
            // Update the badge count for other doctors
            fetchDoctors(pacienteId);
          }
        })
        .subscribe();
        
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [pacienteId, selectedDoctor]);

  useEffect(() => {
    // Filter doctors based on search query
    if (searchQuery.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(doctor => 
        doctor.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.especialidade && doctor.especialidade.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredDoctors(filtered);
    }
  }, [searchQuery, doctors]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadDemoData = () => {
    setDemoMode(true);
    // Dados fictícios de médicos para demonstração
    const demoMedicos: DoctorInfo[] = [
      {
        id: 1,
        nome: 'Dr. Carlos Oliveira',
        especialidade: 'Neurologia',
        avatar_url: 'https://i.pravatar.cc/150?img=11',
        ultima_mensagem: 'Como está se sentindo com o tratamento?',
        data_ultima_mensagem: new Date().toISOString(),
        mensagens_nao_lidas: 1
      },
      {
        id: 2,
        nome: 'Dra. Juliana Santos',
        especialidade: 'Pediatria',
        avatar_url: 'https://i.pravatar.cc/150?img=32',
        ultima_mensagem: 'Lembre-se de seguir a prescrição conforme orientado',
        data_ultima_mensagem: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        mensagens_nao_lidas: 0
      },
      {
        id: 3,
        nome: 'Dr. Ricardo Mendes',
        especialidade: 'Ortopedia',
        avatar_url: 'https://i.pravatar.cc/150?img=53',
        ultima_mensagem: 'Podemos remarcar para a próxima semana',
        data_ultima_mensagem: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        mensagens_nao_lidas: 0
      }
    ];
    
    setDoctors(demoMedicos);
    setFilteredDoctors(demoMedicos);
    setShowRequestChat(false);
  };

  const loadDemoMessages = (doctorId: number) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    // Mensagens fictícias baseadas no médico selecionado
    let demoMessages: ChatMessage[] = [];
    
    if (doctorId === 1) {
      // Mensagens para Dr. Carlos Oliveira
      demoMessages = [
        {
          id: 101,
          sender_id: 1,
          receiver_id: pacienteId || 99,
          content: 'Olá, como está se sentindo desde nossa última consulta?',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 102,
          sender_id: pacienteId || 99,
          receiver_id: 1,
          content: 'Estou me sentindo bem melhor, doutor. As dores diminuíram bastante.',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 103,
          sender_id: 1,
          receiver_id: pacienteId || 99,
          content: 'Ótimo! E quanto aos efeitos colaterais que conversamos?',
          created_at: yesterday.toISOString(),
          is_read: true
        },
        {
          id: 104,
          sender_id: pacienteId || 99,
          receiver_id: 1,
          content: 'Tive um pouco de sonolência nos primeiros dias, mas agora está normal.',
          created_at: yesterday.toISOString(),
          is_read: true
        },
        {
          id: 105,
          sender_id: 1,
          receiver_id: pacienteId || 99,
          content: 'Como está se sentindo com o tratamento?',
          created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          is_read: false
        },
      ];
    } else if (doctorId === 2) {
      // Mensagens para Dra. Juliana Santos
      demoMessages = [
        {
          id: 201,
          sender_id: pacienteId || 99,
          receiver_id: 2,
          content: 'Bom dia doutora, tenho uma dúvida sobre o remédio',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 202,
          sender_id: 2,
          receiver_id: pacienteId || 99,
          content: 'Bom dia! Pode perguntar, estou aqui para ajudar.',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 203,
          sender_id: pacienteId || 99,
          receiver_id: 2,
          content: 'Posso tomar o medicamento junto com as refeições?',
          created_at: yesterday.toISOString(),
          is_read: true
        },
        {
          id: 204,
          sender_id: 2,
          receiver_id: pacienteId || 99,
          content: 'Lembre-se de seguir a prescrição conforme orientado',
          created_at: yesterday.toISOString(),
          is_read: true
        },
      ];
    } else if (doctorId === 3) {
      // Mensagens para Dr. Ricardo Mendes
      demoMessages = [
        {
          id: 301,
          sender_id: 3,
          receiver_id: pacienteId || 99,
          content: 'Olá, vi que você marcou uma consulta para a próxima semana.',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 302,
          sender_id: pacienteId || 99,
          receiver_id: 3,
          content: 'Sim, doutor. Para fazer uma avaliação de rotina.',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 303,
          sender_id: 3,
          receiver_id: pacienteId || 99,
          content: 'Infelizmente terei que remarcar. Tenho uma emergência nesse dia.',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 304,
          sender_id: pacienteId || 99,
          receiver_id: 3,
          content: 'Sem problemas, doutor. Quando podemos remarcar?',
          created_at: twoDaysAgo.toISOString(),
          is_read: true
        },
        {
          id: 305,
          sender_id: 3,
          receiver_id: pacienteId || 99,
          content: 'Podemos remarcar para a próxima semana',
          created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          is_read: true
        },
      ];
    }
    
    setMessages(demoMessages);
  };

  const fetchDoctors = async (patientId: number) => {
    setLoading(true);
    try {
      // Fetch doctors linked to this patient
      const { data: doctorLinks, error } = await supabase
        .from('vinculo_medico_paciente')
        .select('medico_id')
        .eq('paciente_id', patientId);
        
      if (error) {
        // Se a tabela não existir, ativar o modo de demonstração
        if (error.code === '42P01') {
          setDatabaseError(true);
          setDemoMode(true);
          loadDemoData();
          return;
        }
        throw error;
      }
      
      if (doctorLinks && doctorLinks.length > 0) {
        const doctorIds = doctorLinks.map(link => link.medico_id);
        
        // Fetch doctor details
        const { data: doctorData, error: doctorError } = await supabase
          .from('medicos')
          .select('id, nome, especialidade, avatar_url')
          .in('id', doctorIds);
          
        if (doctorError) throw doctorError;
        
        // Get the latest message and unread count for each doctor
        const doctorsWithChat = await Promise.all(doctorData.map(async (doctor) => {
          // Get latest message
          const { data: latestMsg, error: msgError } = await supabase
            .from('mensagens')
            .select('content, created_at')
            .or(`sender_id.eq.${doctor.id},receiver_id.eq.${doctor.id}`)
            .or(`sender_id.eq.${patientId},receiver_id.eq.${patientId}`)
            .order('created_at', { ascending: false })
            .limit(1);
            
          // Get unread count
          const { count, error: countError } = await supabase
            .from('mensagens')
            .select('id', { count: 'exact', head: true })
            .eq('receiver_id', patientId)
            .eq('sender_id', doctor.id)
            .eq('is_read', false);
            
          return {
            ...doctor,
            ultima_mensagem: latestMsg && latestMsg[0] ? latestMsg[0].content : undefined,
            data_ultima_mensagem: latestMsg && latestMsg[0] ? latestMsg[0].created_at : undefined,
            mensagens_nao_lidas: count || 0
          };
        }));
        
        // Sort by latest message date
        doctorsWithChat.sort((a, b) => {
          if (!a.data_ultima_mensagem) return 1;
          if (!b.data_ultima_mensagem) return -1;
          return new Date(b.data_ultima_mensagem).getTime() - new Date(a.data_ultima_mensagem).getTime();
        });
        
        setDoctors(doctorsWithChat);
        setFilteredDoctors(doctorsWithChat);
        setShowRequestChat(doctorsWithChat.length === 0);
      } else {
        setShowRequestChat(true);
      }
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
      setDatabaseError(true);
      setDemoMode(true);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (patientId: number, doctorId: number) => {
    setMessagesLoading(true);
    try {
      // No modo de demonstração, carregamos mensagens fictícias
      if (demoMode) {
        loadDemoMessages(doctorId);
        setMessagesLoading(false);
        return;
      }

      // Fetch messages between patient and doctor
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
        .or(`and(sender_id.eq.${patientId},receiver_id.eq.${doctorId}),and(sender_id.eq.${doctorId},receiver_id.eq.${patientId})`)
        .order('created_at', { ascending: true });
        
      if (error) {
        if (error.code === '42P01') {
          // Se a tabela não existir, ativar o modo de demonstração
          setDatabaseError(true);
          setDemoMode(true);
          loadDemoMessages(doctorId);
          return;
        }
        throw error;
      }
      
      if (data) {
        setMessages(data);
        
        // Mark unread messages as read
        const unreadMessages = data
          .filter(msg => msg.receiver_id === patientId && !msg.is_read)
          .map(msg => msg.id);
          
        if (unreadMessages.length > 0) {
          await markMessagesAsRead(unreadMessages);
          // Update doctor list to refresh unread counts
          fetchDoctors(patientId);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      setDatabaseError(true);
      setDemoMode(true);
      loadDemoMessages(doctorId);
    } finally {
      setMessagesLoading(false);
    }
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
    if (!newMessage.trim() || !pacienteId || !selectedDoctor) return;
    
    // No modo de demonstração, simplesmente adicionamos a mensagem à lista local
    if (demoMode || databaseError) {
      const newMsg: ChatMessage = {
        id: Math.floor(Math.random() * 10000),
        sender_id: pacienteId,
        receiver_id: selectedDoctor.id,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        is_read: false
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Atualizar a última mensagem do médico na lista
      const updatedDoctors = doctors.map(doctor => {
        if (doctor.id === selectedDoctor.id) {
          return {
            ...doctor,
            ultima_mensagem: newMessage.trim(),
            data_ultima_mensagem: new Date().toISOString()
          };
        }
        return doctor;
      });
      
      setDoctors(updatedDoctors);
      setFilteredDoctors(updatedDoctors.filter(doctor => 
        doctor.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.especialidade && doctor.especialidade.toLowerCase().includes(searchQuery.toLowerCase()))
      ));
      
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .insert([
          {
            sender_id: pacienteId,
            receiver_id: selectedDoctor.id,
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
        
        // Update doctor list to show latest message
        fetchDoctors(pacienteId);
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

  const handleDoctorSelect = (doctor: DoctorInfo) => {
    setSelectedDoctor(doctor);
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

  const requestChat = async () => {
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação para conversar com um médico foi enviada. Aguarde a resposta.",
    });
    
    // Para fins de demonstração, carregamos médicos fictícios após um pequeno delay
    if (databaseError || demoMode) {
      setTimeout(() => {
        loadDemoData();
      }, 1500);
    }
    // Em um cenário real, aqui você implementaria a criação de um ticket de solicitação
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold mb-2">Chat com Médicos</h1>
      <p className="text-gray-600 mb-6">
        Converse com seus médicos diretamente pela plataforma
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
      
      {showRequestChat ? (
        <div className="border rounded-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto bg-gray-100 rounded-full p-4 inline-block mb-4">
              <Message className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Você ainda não tem médicos vinculados</h2>
            <p className="text-gray-600 mb-4">
              Para iniciar uma conversa, você precisa estar vinculado a um médico.
              Você pode solicitar o vínculo ou aguardar que um médico o adicione.
            </p>
          </div>
          <Button 
            className="bg-[#00B3B0] hover:bg-[#009E9B]"
            onClick={requestChat}
          >
            Solicitar vínculo com médico
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
          {/* Left sidebar with doctor list */}
          <div className="w-1/3 border-r bg-gray-50 flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar médico..."
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
              ) : filteredDoctors.length > 0 ? (
                filteredDoctors.map(doctor => (
                  <div
                    key={doctor.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-100 transition-colors ${selectedDoctor?.id === doctor.id ? 'bg-gray-100' : ''}`}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={doctor.avatar_url} alt={doctor.nome} />
                          <AvatarFallback>{doctor.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {doctor.mensagens_nao_lidas && doctor.mensagens_nao_lidas > 0 && (
                          <div className="absolute -top-1 -right-1 bg-[#00B3B0] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {doctor.mensagens_nao_lidas}
                          </div>
                        )}
                      </div>
                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{doctor.nome}</span>
                          {doctor.data_ultima_mensagem && (
                            <span className="text-xs text-gray-500">{formatPreviewDate(doctor.data_ultima_mensagem)}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{doctor.especialidade || 'Médico'}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {doctor.ultima_mensagem || 'Iniciar conversa...'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery ? 'Nenhum médico encontrado' : 'Nenhum médico disponível'}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Right side with chat messages */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedDoctor ? (
              <>
                {/* Chat header */}
                <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedDoctor.avatar_url} alt={selectedDoctor.nome} />
                      <AvatarFallback>{selectedDoctor.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <div className="font-medium">{selectedDoctor.nome}</div>
                      <div className="text-xs text-gray-500">{selectedDoctor.especialidade || 'Médico'}</div>
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
                        const isMyMessage = message.sender_id === pacienteId;
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
                      <p className="text-sm">Comece a conversar com Dr. {selectedDoctor.nome}!</p>
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
                <p>Selecione um médico para iniciar uma conversa.</p>
              </div>
            )}
          </div>
        </div>
      )}
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

export default ChatPaciente;
