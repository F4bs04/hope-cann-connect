
import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useAuth } from '@/hooks/useAuth';
import { Bell, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

// This is a placeholder component that would be connected to real notifications data
const Notificacoes = () => {
  const { userData } = useAuth();
  const userType = null; // Temporarily disabled
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      
      try {
        // Placeholder - in a real app, you would fetch notifications from your database
        // Example of how it might look:
        // const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userData?.id);
        
        // For now, just use dummy data based on user type
        const dummyNotifications = [];
        
        if (userType === 'paciente') {
          dummyNotifications.push(
            { id: 1, title: 'Lembrete de Consulta', message: 'Você tem uma consulta agendada para amanhã às 14:00.', read: false, date: new Date(Date.now() - 1000 * 60 * 60 * 3) },
            { id: 2, title: 'Nova Receita Disponível', message: 'Dr. Ana Silva emitiu uma nova receita para você.', read: true, date: new Date(Date.now() - 1000 * 60 * 60 * 24) }
          );
        } else if (userType === 'medico') {
          dummyNotifications.push(
            { id: 1, title: 'Novo Paciente', message: 'Um novo paciente foi agendado para sua clínica.', read: false, date: new Date(Date.now() - 1000 * 60 * 60 * 2) },
            { id: 2, title: 'Cancelamento', message: 'A consulta das 15:00 foi cancelada pelo paciente.', read: true, date: new Date(Date.now() - 1000 * 60 * 60 * 12) }
          );
        } else if (userType === 'admin_clinica') {
          dummyNotifications.push(
            { id: 1, title: 'Novo Médico', message: 'Dr. Carlos Mendes solicitou acesso à sua clínica.', read: false, date: new Date(Date.now() - 1000 * 60 * 60 * 1) },
            { id: 2, title: 'Relatório Disponível', message: 'O relatório mensal de consultas está disponível para visualização.', read: true, date: new Date(Date.now() - 1000 * 60 * 60 * 48) }
          );
        }
        
        setNotifications(dummyNotifications);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, [userType, userData]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const formatDate = (date) => {
    // Check if less than 24 hours
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    
    if (hours < 1) {
      return 'Agora mesmo';
    } else if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <PageContainer title="Notificações">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="text-hopecann-teal" />
            <h2 className="text-xl font-semibold text-gray-800">
              Suas Notificações
            </h2>
          </div>
          
          {notifications.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma notificação</h3>
            <p className="text-gray-500">Você não tem notificações no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 border rounded-lg transition-all ${notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-lg font-semibold ${notification.read ? 'text-gray-800' : 'text-hopecann-teal'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-gray-400 text-sm mt-2">{formatDate(notification.date)}</p>
                  </div>
                  
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-hopecann-teal hover:text-hopecann-teal/80"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default Notificacoes;
