import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useUnifiedAuth';
import { chatService } from '@/services/chat/chatService';
import { 
  Send, 
  FileText, 
  Image as ImageIcon, 
  Paperclip, 
  Download,
  X,
  MessageCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  user_id: string;
  specialty: string;
  crm: string;
  profile: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    full_name?: string;
    email?: string;
  };
}

interface ChatMedicoTextoProps {
  doctor: Doctor;
  onClose: () => void;
}

const ChatMedicoTexto: React.FC<ChatMedicoTextoProps> = ({ doctor, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  
  const { userProfile } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile && doctor) {
      initializeChat();
    }
  }, [userProfile, doctor]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      
      // Buscar dados do paciente
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError || !patientData) {
        throw new Error('Dados do paciente não encontrados');
      }

      setPatientId(patientData.id);

      // Inicializar chat
      const chatResult = await chatService.startChat(doctor.id, patientData.id);
      if (chatResult.success && chatResult.chatId) {
        setChatId(chatResult.chatId);
        await loadMessages(chatResult.chatId);
        await markMessagesAsRead(chatResult.chatId);
      }
    } catch (error: any) {
      console.error('Erro ao inicializar chat:', error);
      toast.error('Erro ao carregar chat: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const result = await chatService.getChatMessages(chatId);
      if (result.success) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const markMessagesAsRead = async (chatId: string) => {
    if (!userProfile?.id) return;
    try {
      await chatService.markMessageAsRead(chatId, userProfile.id);
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; fileName: string }> => {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `chat-documents/${chatId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documentos_medicos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('documentos_medicos')
      .getPublicUrl(filePath);

    return { url: publicUrl, fileName: file.name };
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !chatId || !userProfile?.id) return;

    setIsSending(true);
    try {
      let fileUrl = '';
      let fileName = '';
      let fileType = '';

      // Upload do arquivo se existir
      if (selectedFile) {
        setUploadingFile(true);
        const uploadResult = await uploadFile(selectedFile);
        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
        fileType = selectedFile.type;
        setUploadingFile(false);
      }

      // Enviar mensagem
      const messageText = newMessage.trim() || (selectedFile ? `📎 ${fileName}` : '');
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: userProfile.id,
          message: messageText,
          file_url: fileUrl || null,
          file_name: fileName || null,
          file_type: fileType || null,
          is_read: false
        });

      if (error) throw error;

      // Limpar campos
      setNewMessage('');
      setSelectedFile(null);
      
      // Recarregar mensagens
      await loadMessages(chatId);
      
      toast.success('Mensagem enviada!');
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem: ' + error.message);
    } finally {
      setIsSending(false);
      setUploadingFile(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tamanho do arquivo (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 10MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      toast.error('Erro ao baixar arquivo');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando chat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {doctor.profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                Dr. {doctor.profile.full_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {doctor.specialty} • CRM: {doctor.crm}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              Chat
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col">
        {/* Área de mensagens */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Nenhuma mensagem ainda</p>
                <p className="text-sm">Envie uma mensagem para iniciar a conversa</p>
              </div>
            ) : (
              messages.map((message) => {
                const isFromUser = message.sender_id === userProfile?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isFromUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="space-y-2">
                        <p className="text-sm">{message.message}</p>
                        
                        {message.file_url && (
                          <div className="border rounded p-2 bg-background/10">
                            <div className="flex items-center gap-2">
                              {getFileIcon(message.file_type || '')}
                              <span className="text-xs truncate flex-1">
                                {message.file_name}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => downloadFile(message.file_url!, message.file_name!)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3 opacity-60" />
                          <span className="text-xs opacity-60">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Área de entrada */}
        <div className="border-t p-4 space-y-3">
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              {getFileIcon(selectedFile.type)}
              <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="min-h-[60px] resize-none"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                onClick={sendMessage}
                disabled={isSending || uploadingFile || (!newMessage.trim() && !selectedFile)}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatMedicoTexto;