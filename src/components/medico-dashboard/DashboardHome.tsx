
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, User, Bell, Clock, FileCheck, Activity, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getPacientes, getReceitas, getProntuarios } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';

interface DashboardHomeProps {
  onOpenConsulta: (consultaId: number) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onOpenConsulta }) => {
  const [loading, setLoading] = useState(true);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [receitas, setReceitas] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [consultasCount, setConsultasCount] = useState(0);
  const [proximaConsulta, setProximaConsulta] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Carregar pacientes
      const pacientesData = await getPacientes();
      setPacientes(pacientesData || []);
      
      // Carregar receitas
      const receitasData = await getReceitas();
      setReceitas(receitasData || []);
      
      // Carregar prontuários para contar consultas realizadas
      const prontuariosData = await getProntuarios();
      setConsultasCount(prontuariosData?.length || 0);
      
      // Buscar próximas consultas agendadas
      const hoje = new Date();
      const { data: consultasData, error } = await supabase
        .from('consultas')
        .select('*')
        .gt('data_hora', hoje.toISOString())
        .order('data_hora', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar consultas:', error);
      } else {
        setConsultas(consultasData || []);
        setProximaConsulta(consultasData?.[0] || null);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo, Dr. João</h1>
          <p className="text-gray-600">Última visita: {format(new Date(), 'dd MMM yyyy', { locale: ptBR })}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-sm text-teal-500 font-medium">Saldo para consultas: 150</span>
          </div>
          <Bell className="h-6 w-6 text-gray-400" />
          <div className="h-10 w-10 rounded-full bg-teal-500 overflow-hidden">
            <img 
              src="/public/lovable-uploads/4187ef44-3d50-43dc-afd3-3632726fbd1f.png" 
              alt="Perfil do médico" 
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-teal-500" />
              Próxima Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proximaConsulta ? (
              <>
                <p className="text-2xl font-bold">{format(new Date(proximaConsulta.data_hora), 'dd MMM yyyy', { locale: ptBR })}</p>
                <p className="text-gray-600">{format(new Date(proximaConsulta.data_hora), 'HH:mm')} - {proximaConsulta.tipo_consulta || 'Consulta padrão'}</p>
              </>
            ) : (
              <>
                <p className="text-gray-500">Nenhuma consulta agendada</p>
                <Button variant="link" className="p-0 h-auto text-teal-500" onClick={() => window.location.href = '/area-medico?tab=agenda'}>
                  Agendar consulta
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2 text-teal-500" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{receitas.length}</p>
            <p className="text-gray-600">
              {receitas.length > 0 
                ? `Última: ${format(new Date(receitas[0].data), 'dd MMM', { locale: ptBR })}` 
                : 'Nenhuma receita emitida'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <User className="h-5 w-5 mr-2 text-teal-500" />
              Consultas Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{consultasCount}</p>
            <p className="text-gray-600">Em {new Date().getFullYear()}</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="agenda" className="mt-6">
        <TabsList>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agenda" className="mt-4">
          <h3 className="text-xl font-bold mb-4">Próximas Consultas</h3>
          {loading ? (
            <p className="text-center py-4">Carregando consultas...</p>
          ) : consultas.length > 0 ? (
            <div className="space-y-4">
              {consultas.slice(0, 2).map(consulta => (
                <Card key={consulta.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onOpenConsulta(consulta.id)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-4">
                        <Clock className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-medium">Paciente #{consulta.id_paciente}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(consulta.data_hora), "dd 'de' MMMM', ' yyyy 'às' HH:mm", { locale: ptBR })} - {consulta.tipo_consulta || 'Consulta padrão'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      onOpenConsulta(consulta.id);
                    }}>
                      Ver detalhes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Nenhuma consulta agendada</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">
                    Você não possui consultas agendadas para os próximos dias.
                  </p>
                  <Button onClick={() => window.location.href = '/area-medico?tab=agenda'}>
                    Agendar consulta
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="receitas" className="mt-4">
          <h3 className="text-xl font-bold mb-4">Últimas Receitas</h3>
          {loading ? (
            <p className="text-center py-4">Carregando receitas...</p>
          ) : receitas.length > 0 ? (
            <div className="space-y-4">
              {receitas.slice(0, 2).map(receita => (
                <Card key={receita.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Receita para {receita.pacientes_app?.nome || `Paciente #${receita.id_paciente}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          Emitida em {format(new Date(receita.data), "dd/MM/yyyy")} - {receita.medicamento}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '/area-medico?tab=receitas'}
                    >
                      Ver Receita
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Nenhuma receita emitida</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">
                    Você ainda não emitiu nenhuma receita.
                  </p>
                  <Button onClick={() => window.location.href = '/area-medico?tab=prescricoes'}>
                    Emitir nova receita
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="pacientes">
          <h3 className="text-xl font-bold mb-4">Meus Pacientes</h3>
          {loading ? (
            <p className="text-center py-4">Carregando pacientes...</p>
          ) : pacientes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pacientes.slice(0, 3).map(paciente => (
                <Card key={paciente.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium">{paciente.nome}</p>
                        <p className="text-sm text-gray-500">{paciente.idade} anos</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Última consulta:</span>
                        <span>{format(new Date(paciente.ultima_consulta), 'dd/MM/yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Condição:</span>
                        <span>{paciente.condicao || 'Não especificada'}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => window.location.href = `/area-medico?tab=prontuarios&paciente=${paciente.id}`}
                    >
                      Ver prontuário
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Nenhum paciente cadastrado</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">
                    Você ainda não possui pacientes cadastrados.
                  </p>
                  <Button onClick={() => window.location.href = '/area-medico?tab=pacientes'}>
                    Cadastrar paciente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="mensagens">
          <h3 className="text-xl font-bold mb-4">Mensagens</h3>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Você não tem mensagens</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Quando seus pacientes enviarem mensagens, elas aparecerão aqui para que você possa respondê-las.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCheck className="h-5 w-5 mr-2 text-teal-500" />
              Atestados Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Carregando atestados...</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <FileCheck className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Nenhum atestado emitido recentemente</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.location.href = '/area-medico?tab=atestados'}
                  >
                    Emitir
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-teal-500" />
              Exames Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Carregando exames...</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Nenhum exame pendente</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.location.href = '/area-medico?tab=pedidos-exame'}
                  >
                    Solicitar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
