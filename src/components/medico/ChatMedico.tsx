import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, FileText, Pill } from 'lucide-react';
import { useAuth } from '@/hooks/useUnifiedAuth';
import { chatService } from '@/services/chat/chatService';
import { supabase } from '@/integrations/supabase/client';
import ReceitaDialog from './ReceitaDialog';

// Componente de chat integrado com sistema de receitas
const ChatMedico = () => {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [receitaDialogOpen, setReceitaDialogOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  const { userProfile } = useAuth();

  useEffect(() => {
    loadPatients();
  }, [userProfile]);

  const loadPatients = async () => {
    if (!userProfile?.id) return;
    
    setLoading(true);
    try {
      // Buscar pacientes com consultas agendadas/realizadas para este médico
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!inner(
            *,
            profiles(full_name, email)
          )
        `)
        .eq('doctor_id', userProfile.id)
        .in('status', ['scheduled', 'completed', 'in_progress']);

      if (appointmentsError) throw appointmentsError;

      // Extrair pacientes únicos das consultas
      const uniquePatients = [];
      const patientIds = new Set();
      
      appointmentsData?.forEach(appointment => {
        if (appointment.patients && !patientIds.has(appointment.patients.id)) {
          patientIds.add(appointment.patients.id);
          uniquePatients.push({
            ...appointment.patients,
            full_name: appointment.patients.profiles?.full_name || appointment.patients.full_name,
            email: appointment.patients.profiles?.email || '',
            lastAppointment: appointment.scheduled_at,
            appointmentStatus: appointment.status
          });
        }
      });
      
      // Buscar chats ativos para estes pacientes
      const chatsResult = await chatService.getActiveChats(userProfile.id);
      if (chatsResult.success) {
        // Combinar pacientes com chats ativos
        const patientsWithChats = uniquePatients.map(patient => {
          const activeChat = chatsResult.data.find(chat => 
            chat.patient_id === patient.id
          );
          return {
            ...patient,
            hasActiveChat: !!activeChat,
            lastMessageAt: activeChat?.last_message_at
          };
        });
        setPatients(patientsWithChats);
      } else {
        setPatients(uniquePatients);
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patient: any) => {
    setSelectedPatient(patient);
    
    if (!userProfile?.id) return;
    
    // Criar/obter chat_id
    const chatResult = await chatService.startChat(userProfile.id, patient.id);
    if (chatResult.success) {
      setCurrentChatId(chatResult.chatId);
      
      // Carregar mensagens do chat
      const messagesResult = await chatService.getChatMessages(chatResult.chatId);
      if (messagesResult.success) {
        setMessages(messagesResult.data);
        
        // Marcar mensagens como lidas
        await chatService.markMessageAsRead(chatResult.chatId, userProfile.id);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedPatient || !currentChatId || !userProfile?.id) return;

    const messageText = message.trim();
    setMessage('');

    // Enviar mensagem
    const result = await chatService.sendMessage(currentChatId, userProfile.id, messageText);
    
    if (result.success) {
      // Adicionar mensagem localmente para feedback imediato
      const newMessage = {
        id: Date.now().toString(),
        chat_id: currentChatId,
        sender_id: userProfile.id,
        message: messageText,
        created_at: new Date().toISOString(),
        is_read: false,
        sender: {
          full_name: userProfile.full_name || 'Médico',
          email: userProfile.email
        }
      };

      setMessages(prev => [...prev, newMessage]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hopecann-teal"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Lista de Pacientes */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversas Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {patients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum paciente com consultas</p>
                <p className="text-sm">Pacientes aparecerão após agendamentos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? 'bg-hopecann-teal/10 border border-hopecann-teal'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{patient.full_name || 'Nome não informado'}</p>
                        <p className="text-sm text-gray-500">
                          {patient.hasActiveChat ? 'Chat ativo' : 'Clique para iniciar conversa'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Última consulta: {new Date(patient.lastAppointment).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-blue-600">
                          Status: {patient.appointmentStatus === 'completed' ? 'Realizada' : 
                                   patient.appointmentStatus === 'scheduled' ? 'Agendada' : 'Em andamento'}
                        </p>
                      </div>
                      {patient.hasActiveChat && (
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Área de Chat */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {selectedPatient ? `Chat com ${selectedPatient.full_name || 'Paciente'}` : 'Selecione uma conversa'}
            </span>
            {selectedPatient && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReceitaDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Pill className="h-4 w-4" />
                Criar Receita
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 mb-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {selectedPatient ? (
                  <p>Nenhuma mensagem ainda. Inicie uma conversa!</p>
                ) : (
                  <p>Selecione um paciente para iniciar uma conversa</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isFromDoctor = msg.sender_id === userProfile?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isFromDoctor ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          isFromDoctor
                            ? 'bg-hopecann-teal text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs opacity-75">
                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {isFromDoctor && (
                            <span className="text-xs opacity-75">
                              {msg.is_read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {selectedPatient && (
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ReceitaDialog 
        open={receitaDialogOpen}
        onOpenChange={setReceitaDialogOpen}
        selectedPaciente={selectedPatient}
      />
    </div>
  );
};

export default ChatMedico;