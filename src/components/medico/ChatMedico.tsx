import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useUnifiedAuth';

// Componente simplificado de chat
const ChatMedico = () => {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { userProfile } = useAuth();

  useEffect(() => {
    // Por enquanto, retornamos array vazio
    // TODO: Implementar quando o sistema de chat estiver integrado com o schema atual
    setPatients([]);
    setLoading(false);
  }, [userProfile]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedPatient) return;

    // Mock - adicionar mensagem localmente
    const newMessage = {
      id: Date.now(),
      sender_id: userProfile?.id,
      message: message.trim(),
      created_at: new Date().toISOString(),
      sender_type: 'doctor'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
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
                <p>Nenhuma conversa ativa</p>
                <p className="text-sm">As conversas aparecerão após consultas realizadas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? 'bg-hopecann-teal/10 border border-hopecann-teal'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-medium">{patient.nome}</p>
                    <p className="text-sm text-gray-500">Última mensagem...</p>
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
          <CardTitle>
            {selectedPatient ? `Chat com ${selectedPatient.nome}` : 'Selecione uma conversa'}
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
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_type === 'doctor' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.sender_type === 'doctor'
                          ? 'bg-hopecann-teal text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
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
    </div>
  );
};

export default ChatMedico;