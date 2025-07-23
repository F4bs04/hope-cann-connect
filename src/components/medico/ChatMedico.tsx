
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, ArrowLeft, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enviarMensagem, getMensagensChat, marcarMensagensComoLidas } from '@/services/chat/chatService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  id: number;
  id_medico: number;
  id_paciente: number;
  remetente_tipo: 'medico' | 'paciente';
  mensagem: string;
  data_envio: string;
  lida: boolean;
  id_consulta?: number;
}

interface ChatMedicoProps {
  medicoId: number;
  pacienteId: number;
  pacienteNome: string;
  motivoConsulta?: string;
  dataConsulta?: string;
  onBack: () => void;
}

const ChatMedico: React.FC<ChatMedicoProps> = ({ 
  medicoId, 
  pacienteId, 
  pacienteNome, 
  motivoConsulta, 
  dataConsulta, 
  onBack 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Função para carregar mensagens do chat
  const loadMessages = async () => {
    setLoading(true);
    try {
      const chatMessages = await getMensagensChat(medicoId, pacienteId);
      // Type assertion para garantir que os objetos recebidos correspondam ao tipo ChatMessage
      setMessages(chatMessages as ChatMessage[]);
      
      // Marcar as mensagens do paciente como lidas
      await marcarMensagensComoLidas(medicoId, pacienteId, 'medico');
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar o histórico de mensagens",
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar mensagens quando o componente for montado
  useEffect(() => {
    loadMessages();
    
    // Configurar polling para atualizar mensagens a cada 30 segundos
    const interval = setInterval(() => {
      loadMessages();
    }, 30000);
    
    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(interval);
  }, [medicoId, pacienteId]);

  // Rolar para a última mensagem quando novas mensagens forem adicionadas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar nova mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const messageData = {
      id_medico: medicoId,
      id_paciente: pacienteId,
      remetente_tipo: 'medico' as const,
      mensagem: newMessage.trim()
    };
    
    try {
      const sentMessage = await enviarMensagem(messageData);
      if (sentMessage) {
        // Type assertion para garantir que o objeto recebido corresponda ao tipo ChatMessage
        setMessages([...messages, sentMessage as ChatMessage]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Button 
        variant="ghost" 
        className="w-fit flex items-center mb-4"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Conversas
      </Button>
      
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-hopecann-teal" />
                Conversa com {pacienteNome}
              </CardTitle>
              {motivoConsulta && (
                <CardDescription className="mt-1">
                  Motivo: {motivoConsulta}
                </CardDescription>
              )}
              {dataConsulta && (
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span>Consulta realizada em: {format(new Date(dataConsulta), "dd/MM/yyyy")}</span>
                </div>
              )}
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Chat ativo
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col p-0">
          <div className="flex-grow overflow-y-auto px-4 py-2">
            {loading && messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin h-6 w-6 border-2 border-hopecann-teal border-t-transparent rounded-full"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-center">Nenhuma mensagem trocada ainda.</p>
                <p className="text-center text-sm mt-2">Envie uma mensagem para iniciar a conversa.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.remetente_tipo === 'medico' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.remetente_tipo === 'medico'
                          ? 'bg-hopecann-teal text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.mensagem}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span 
                          className={`text-xs ${
                            message.remetente_tipo === 'medico' ? 'text-white/80' : 'text-gray-500'
                          }`}
                        >
                          {format(new Date(message.data_envio), "HH:mm", { locale: ptBR })}
                        </span>
                        {message.remetente_tipo === 'medico' && (
                          <span className="text-xs text-white/80 ml-2">
                            {message.lida ? 'Lida' : 'Enviada'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea 
                placeholder="Digite sua mensagem..." 
                className="resize-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                className="bg-hopecann-teal hover:bg-hopecann-teal/90"
                onClick={handleSendMessage}
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatMedico;
