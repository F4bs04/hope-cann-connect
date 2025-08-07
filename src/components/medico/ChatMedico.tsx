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
      console.log('Loading patients for doctor:', userProfile.id);
      
      // Primeiro, buscar pacientes com consultas agendadas/realizadas
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
        .in('status', ['scheduled', 'completed', 'in_progress'])
        .order('scheduled_at', { ascending: false });

      if (appointmentsError) {
        console.error('Error loading appointments:', appointmentsError);
        setPatients([]);
        return;
      }

      console.log('Appointments found:', appointmentsData);

      if (!appointmentsData || appointmentsData.length === 0) {
        console.log('No appointments found');
        setPatients([]);
        return;
      }

      // Extrair pacientes únicos das consultas
      const uniquePatients = [];
      const patientIds = new Set();
      
      for (const appointment of appointmentsData) {
        if (appointment.patients && !patientIds.has(appointment.patients.id)) {
          patientIds.add(appointment.patients.id);
          
          // Verificar se existe chat ativo para este paciente
          const { data: activeChats } = await supabase
            .from('active_chats')
            .select('id, created_at, updated_at')
            .eq('doctor_id', userProfile.id)
            .eq('patient_id', appointment.patients.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1);

          let hasActiveChat = false;
          let chatId = null;
          let lastMessageAt = null;

          if (activeChats && activeChats.length > 0) {
            hasActiveChat = true;
            chatId = activeChats[0].id;
            
            // Buscar última mensagem do chat
            const { data: lastMessage } = await supabase
              .from('chat_messages')
              .select('created_at')
              .eq('chat_id', chatId)
              .order('created_at', { ascending: false })
              .limit(1);

            if (lastMessage && lastMessage.length > 0) {
              lastMessageAt = lastMessage[0].created_at;
            }
          }

          uniquePatients.push({
            id: appointment.patients.id,
            full_name: appointment.patients.profiles?.full_name || appointment.patients.full_name || 'Nome não informado',
            email: appointment.patients.profiles?.email || '',
            lastAppointment: appointment.scheduled_at,
            appointmentStatus: appointment.status,
            hasActiveChat,
            chatId,
            lastMessageAt
          });
        }
      }
      
      console.log('Unique patients found:', uniquePatients);
      setPatients(uniquePatients);
      
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
    
    // Se o paciente já tem um chat ativo, usar esse ID
    if (patient.chatId) {
      setCurrentChatId(patient.chatId);
      
      // Carregar mensagens do chat
      const messagesResult = await chatService.getChatMessages(patient.chatId);
      if (messagesResult.success) {
        setMessages(messagesResult.data);
        
        // Marcar mensagens como lidas
        await chatService.markMessageAsRead(patient.chatId, userProfile.id);
      }
    } else {
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
        
        // Atualizar a lista de pacientes
        await loadPatients();
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
            Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {patients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum paciente encontrado</p>
                <p className="text-sm">Pacientes com consultas agendadas aparecerão aqui</p>
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
                      <div className="flex-1">
                        <p className="font-medium">{patient.full_name}</p>
                        <p className="text-sm text-gray-500">
                          {patient.hasActiveChat ? 'Chat disponível' : 'Iniciar conversa'}
                        </p>
                        {patient.lastAppointment && (
                          <p className="text-xs text-gray-400">
                            Consulta: {new Date(patient.lastAppointment).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        {patient.lastMessageAt && (
                          <p className="text-xs text-blue-600">
                            Última mensagem: {new Date(patient.lastMessageAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
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
              {selectedPatient ? `Chat com ${selectedPatient.full_name}` : 'Selecione um paciente'}
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
