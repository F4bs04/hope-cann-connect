
import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle, User, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getChatsAtivos } from '@/services/chat/chatService';

interface ChatsListProps {
  medicoId: number;
  onSelectChat: (chat: any) => void;
}

interface ChatData {
  id: number;
  data_inicio: string;
  data_fim: string;
  consultas?: {
    id?: number;
    motivo?: string;
  } | null;
  pacientes?: {
    id?: number;
    nome?: string;
  } | null;
}

const ChatsList: React.FC<ChatsListProps> = ({ medicoId, onSelectChat }) => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [chats, setChats] = useState<ChatData[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatData[]>([]);

  useEffect(() => {
    const filtered = chats.filter(chat => 
      chat.pacientes && 
      chat.pacientes.nome && 
      chat.pacientes.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [searchTerm, chats]);

  useEffect(() => {
    loadChats();
  }, [medicoId]);

  const loadChats = async () => {
    if (!medicoId) return;
    
    setLoading(true);
    try {
      const data = await getChatsAtivos(medicoId.toString());
      // Safely handle potentially invalid data structures
      const processedChats = data.map((chat: any) => ({
        ...chat,
        consultas: {
          id: chat.consultas?.id || 0,
          motivo: chat.consultas?.motivo || 'Consulta'
        },
        pacientes: {
          id: chat.pacientes?.id || 0,
          nome: chat.pacientes?.nome || 'Paciente'
        }
      }));
      
      setChats(processedChats);
      setFilteredChats(processedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      setChats([]);
      setFilteredChats([]);
      // Você pode adicionar um toast aqui para mostrar o erro ao usuário
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Conversas Ativas</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar paciente..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full"></div>
        </div>
      ) : filteredChats.length === 0 ? (
        <div className="text-center my-12 text-gray-500">
          {chats.length === 0 ? (
            <>
              <MessageCircle className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-lg">Nenhuma conversa ativa no momento</p>
              <p className="mt-2">As conversas serão ativadas automaticamente após a conclusão de consultas.</p>
            </>
          ) : (
            <>
              <Search className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4">Nenhuma conversa encontrada para "{searchTerm}"</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => setSearchTerm('')}
              >
                Mostrar todas as conversas
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChats.map(chat => (
            <Card 
              key={chat.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectChat(chat)}
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-hopecann-teal w-full md:w-2 p-0 md:p-0"></div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{chat.pacientes?.nome || 'Paciente'}</h3>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Chat ativo
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {chat.consultas?.motivo || 'Consulta'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Início: {format(new Date(chat.data_inicio), "dd/MM/yyyy")}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Expira: {formatDistanceToNow(new Date(chat.data_fim), { locale: ptBR, addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatsList;
