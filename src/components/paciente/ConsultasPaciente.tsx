
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ConsultasPaciente: React.FC = () => {
  const { toast } = useToast();
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dados mockados - em um aplicativo real, viriam do banco de dados
  useEffect(() => {
    // Simular busca de dados
    setTimeout(() => {
      setConsultas([
        {
          id: 1,
          data_hora: new Date(2025, 3, 30, 14, 30),
          medico: {
            id: 2,
            nome: 'Dr. Ricardo Silva',
            especialidade: 'Neurologia',
            foto_perfil: 'https://randomuser.me/api/portraits/men/34.jpg'
          },
          status: 'agendada',
          motivo: 'Avaliação inicial para tratamento com canabidiol'
        },
        {
          id: 2,
          data_hora: new Date(2025, 3, 15, 10, 0),
          medico: {
            id: 3,
            nome: 'Dra. Amanda Oliveira',
            especialidade: 'Clínica Geral',
            foto_perfil: 'https://randomuser.me/api/portraits/women/65.jpg'
          },
          status: 'realizada',
          motivo: 'Acompanhamento de tratamento'
        },
        {
          id: 3,
          data_hora: new Date(2025, 2, 10, 9, 45),
          medico: {
            id: 4,
            nome: 'Dr. João Santos',
            especialidade: 'Neurologia',
            foto_perfil: 'https://randomuser.me/api/portraits/men/44.jpg'
          },
          status: 'cancelada',
          motivo: 'Segunda opinião sobre tratamento'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendada':
        return <Badge className="bg-blue-100 text-blue-800">Agendada</Badge>;
      case 'realizada':
        return <Badge className="bg-green-100 text-green-800">Realizada</Badge>;
      case 'cancelada':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleCancelarConsulta = (id: number) => {
    // Em um aplicativo real, chamaria uma API
    toast({
      title: "Consulta cancelada",
      description: "Sua consulta foi cancelada com sucesso.",
    });
    
    // Atualização local
    setConsultas(consultas.map(consulta => 
      consulta.id === id ? {...consulta, status: 'cancelada'} : consulta
    ));
  };

  const handleReagendar = (id: number) => {
    // Em um aplicativo real, redirecionaria para a tela de agendamento
    toast({
      title: "Reagendamento",
      description: "Você será redirecionado para a página de reagendamento.",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Suas Consultas</h2>
      
      {consultas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma consulta encontrada</h3>
            <p className="text-gray-500 mb-4">
              Você ainda não possui consultas registradas.
            </p>
            <Button onClick={() => window.location.href = '/agendar'}>
              Agendar nova consulta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {consultas.map(consulta => (
            <Card key={consulta.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className={`w-full md:w-2 p-0 md:p-0 ${
                    consulta.status === 'agendada' ? 'bg-blue-500' : 
                    consulta.status === 'realizada' ? 'bg-green-500' : 
                    'bg-red-500'
                  }`}></div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold">{consulta.medico.nome}</h3>
                        <p className="text-sm text-gray-600">{consulta.medico.especialidade}</p>
                      </div>
                      {getStatusBadge(consulta.status)}
                    </div>
                    
                    <p className="text-sm text-gray-700 mt-2">
                      {consulta.motivo}
                    </p>
                    
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{format(new Date(consulta.data_hora), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                      <Clock className="h-4 w-4 ml-3 mr-1" />
                      <span>{format(new Date(consulta.data_hora), "HH:mm", { locale: ptBR })}</span>
                    </div>
                    
                    {consulta.status === 'agendada' && (
                      <div className="mt-3 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReagendar(consulta.id)}
                        >
                          Reagendar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => handleCancelarConsulta(consulta.id)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                    
                    {consulta.status === 'realizada' && (
                      <div className="mt-3 flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">
                          Consulta realizada com sucesso
                        </span>
                      </div>
                    )}
                    
                    {consulta.status === 'cancelada' && (
                      <div className="mt-3 flex items-center">
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm text-red-600">
                          Consulta cancelada
                        </span>
                      </div>
                    )}
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

export default ConsultasPaciente;
