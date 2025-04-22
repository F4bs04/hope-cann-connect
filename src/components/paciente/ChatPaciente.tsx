
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, ArrowLeft, User, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enviarMensagem, getMensagensChat, marcarMensagensComoLidas, verificarChatAtivo } from '@/services/supabaseService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ChatPacienteProps {
  medicoId: number;
  pacienteId: number;
  medicoNome: string;
  medicoEspecialidade: string;
  medicoFoto?: string;
  onBack: () => void;
}

const ChatPaciente: React.FC<ChatPacienteProps> = ({
  medicoId,
  pacienteId,
  medicoNome,
  medicoEspecialidade,
  medicoFoto,
  onBack
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isChatActive, setIsChatActive] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Verificar se o chat está ativo
  useEffect(() => {
    const checkChatStatus = async () => {
      setLoadingStatus(true);
      try {
        const isActive = await verificarChatAtivo(medicoId, pacienteId);
        setIsChatActive(isActive);
      } catch (error) {
        console.error('Error checking chat status:', error);
      } finally {
        setLoadingStatus(false);
      }
    };
    
    checkChatStatus();
  }, [medicoId, pacienteId]);

  // Carregar mensagens
  const loadMessages = async () => {
    if (!isChatActive) return;
    
    setLoading(true);
    try {
      const chatMessages = await getMensagensChat(medicoId, pacienteId);
      setMessages(chatMessages);
      
      // Marcar as mensagens do médico como lidas
      await marcarMensagensComoLidas(medicoId, pacienteId, 'paciente');
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar mensagens quando o componente for montado
  useEffect(() => {
    if (isChatActive) {
      loadMessages();
      
      // Configurar polling para atualizar mensagens
      const interval = setInterval(() => {
        loadMessages();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [medicoId, pacienteId, isChatActive]);

  // Rolar para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar nova mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isChatActive) return;
    
    const messageData = {
      id_medico: medicoId,
      id_paciente: pacienteId,
      remetente_tipo: 'paciente' as const,
      mensagem: newMessage.trim()
    };
    
    try {
      const sentMessage = await enviarMensagem(messageData);
      if (sentMessage) {
        setMessages([...messages, sentMessage]);
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

  if (loadingStatus) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-8">
          <div className="animate-spin h-6 w-6 border-2 border-hopecann-teal border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (!isChatActive) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          className="w-fit flex items-center"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <Alert variant="destructive">
          <AlertTitle>Chat não disponível</AlertTitle>
          <AlertDescription>
            O período de conversação com este médico expirou. Agende uma nova consulta para reativar o chat.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chat encerrado</h3>
            <p className="text-gray-500 mb-4">
              O período de 14 dias para conversação após a consulta expirou.
            </p>
            <Button onClick={() => window.location.href = '/agendar'}>
              Agendar nova consulta
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button 
        variant="ghost" 
        className="w-fit flex items-center"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para médicos
      </Button>
      
      <Card className="flex flex-col h-[calc(100vh-250px)]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              {medicoFoto && (
                <div className="mr-3 flex-shrink-0">
                  <img 
                    src={medicoFoto} 
                    alt={medicoNome} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
              )}
              <div>
                <CardTitle>{medicoNome}</CardTitle>
                <CardDescription>{medicoEspecialidade}</CardDescription>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">Chat ativo</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-hidden p-0">
          <div className="h-full overflow-y-auto px-4 py-2">
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
                    className={`flex ${message.remetente_tipo === 'paciente' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.remetente_tipo === 'paciente'
                          ? 'bg-hopecann-teal text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.mensagem}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span 
                          className={`text-xs ${
                            message.remetente_tipo === 'paciente' ? 'text-white/80' : 'text-gray-500'
                          }`}
                        >
                          {format(new Date(message.data_envio), "HH:mm", { locale: ptBR })}
                        </span>
                        {message.remetente_tipo === 'paciente' && (
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
        </CardContent>
        
        <CardFooter className="p-4 border-t">
          <div className="flex gap-2 w-full">
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
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChatPaciente;
