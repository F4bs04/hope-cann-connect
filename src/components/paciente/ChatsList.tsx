
import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getChatsAtivosPaciente } from '@/services/supabaseService';

interface ChatsPacienteListProps {
  pacienteId: number;
  onSelectChat: (chat: any) => void;
}

const ChatsPacienteList: React.FC<ChatsPacienteListProps> = ({ pacienteId, onSelectChat }) => {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      setLoading(true);
      try {
        const data = await getChatsAtivosPaciente(pacienteId);
        setChats(data);
      } catch (error) {
        console.error('Error loading patient chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
    
    // Atualizar a lista de chats a cada 30 segundos
    const interval = setInterval(() => {
      loadChats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [pacienteId]);

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-center my-12 text-gray-500">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-4 text-lg">Nenhuma conversa ativa</p>
        <p className="mt-2">As conversas são ativadas automaticamente após a conclusão de consultas e permanecem disponíveis por 14 dias.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Suas conversas com médicos</h2>
      {chats.map(chat => (
        <Card 
          key={chat.id} 
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelectChat(chat)}
        >
          <CardContent className="p-4">
            <div className="flex items-start">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={chat.medicos?.foto_perfil} alt={chat.medicos?.nome} />
                <AvatarFallback>{chat.medicos?.nome[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{chat.medicos?.nome}</h3>
                  <Badge className="bg-green-100 text-green-800">
                    Chat ativo
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600">{chat.medicos?.especialidade}</p>
                
                <div className="mt-2 text-sm text-gray-500">
                  <p className="line-clamp-1">{chat.consultas?.motivo}</p>
                </div>
                
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Início: {format(new Date(chat.data_inicio), "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Expira {formatDistanceToNow(new Date(chat.data_fim), { locale: ptBR, addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ChatsPacienteList;
