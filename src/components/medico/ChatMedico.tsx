import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  User, 
  Search, 
  ArrowLeft, 
  Clock,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { 
  chatService, 
  getMensagensChat, 
  enviarMensagem,
  marcarMensagensComoLidas 
} from '@/services/chat/chatService';
import { getPacientes } from '@/services/supabaseService';

interface Patient {
  id: string;
  nome: string;
  email?: string;
  avatar?: string;
}

interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    full_name?: string;
    email?: string;
  };
}

const ChatMedico: React.FC = () => {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  // Obter ID do médico do localStorage
  const doctorId = localStorage.getItem('userId') || '';

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient && doctorId) {
      startChat(selectedPatient.id);
    }
  }, [selectedPatient, doctorId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling para mensagens em tempo real
  useEffect(() => {
    if (currentChatId) {
      const interval = setInterval(() => {
        loadMessages(currentChatId);
      }, 3000); // Atualizar a cada 3 segundos

      return () => clearInterval(interval);
    }
  }, [currentChatId]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getPacientes();
      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de pacientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (patientId: string) => {
    try {
      const result = await chatService.startChat(doctorId, patientId);
      if (result.success) {
        setCurrentChatId(result.chatId);
        await loadMessages(result.chatId);
        // Marcar mensagens como lidas
        await marcarMensagensComoLidas(result.chatId, doctorId);
      } else {
        toast({
          title: "Erro",
          description: "Erro ao iniciar chat",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const chatMessages = await getMensagensChat(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChatId || !selectedPatient) return;

    try {
      setSendingMessage(true);
      const result = await enviarMensagem({
        chat_id: currentChatId,
        sender_id: doctorId,
        message: newMessage.trim()
      });

      if (result.success) {
        setNewMessage('');
        await loadMessages(currentChatId);
        toast({
          title: "Mensagem enviada",
          description: "Sua mensagem foi enviada com sucesso"
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao enviar mensagem",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao enviar mensagem",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isMyMessage = (message: ChatMessage) => message.sender_id === doctorId;

  if (!selectedPatient) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Chat com Pacientes</h1>
          <p className="text-gray-600">Selecione um paciente para iniciar uma conversa</p>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full"></div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">
              {patients.length === 0 ? 'Nenhum paciente encontrado' : 'Nenhum paciente corresponde à busca'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPatients.map(patient => (
              <Card 
                key={patient.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedPatient(patient)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={patient.avatar} />
                      <AvatarFallback>
                        {patient.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{patient.nome}</h3>
                      {patient.email && (
                        <p className="text-sm text-gray-500">{patient.email}</p>
                      )}
                    </div>
                    <MessageCircle className="h-5 w-5 text-hopecann-teal" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => {
            setSelectedPatient(null);
            setMessages([]);
            setCurrentChatId(null);
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={selectedPatient.avatar} />
            <AvatarFallback>
              {selectedPatient.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{selectedPatient.nome}</h2>
            <Badge variant="outline" className="text-xs">
              Chat ativo
            </Badge>
          </div>
        </div>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversa com {selectedPatient.nome}
          </CardTitle>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>Nenhuma mensagem ainda</p>
                <p className="text-sm">Envie a primeira mensagem para iniciar a conversa</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isMyMessage(message)
                          ? 'bg-hopecann-teal text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        isMyMessage(message) ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        <Clock className="h-3 w-3" />
                        {format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
                        {isMyMessage(message) && message.is_read && (
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
          
          <Separator />
          
          <div className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendingMessage}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatMedico;