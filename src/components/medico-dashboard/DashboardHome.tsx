
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, User, Bell, Clock, Coins, ArrowUpRight, ArrowDownRight, AlertCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useMedicoDashboardData } from '@/hooks/useMedicoDashboardData';
import { useMedicoData } from '@/hooks/useMedicoData';
import { useAuth } from '@/hooks/useUnifiedAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardHomeProps {
  onOpenConsulta: (consultaId: number) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onOpenConsulta }) => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading: dashboardLoading } = useMedicoDashboardData();
  const { medicoProfile, isLoading: medicoLoading } = useMedicoData();
  const { userProfile } = useAuth();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const navigateToSection = (section: string, params?: Record<string, string>) => {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    navigate(`/area-medico?tab=${section}${queryParams}`);
  };

  if (dashboardLoading || medicoLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo, {medicoProfile?.nome || 'Doutor(a)'}</h1>
          <p className="text-gray-600">Última visita: {format(new Date(), 'dd MMM yyyy', { locale: ptBR })}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-sm text-teal-500 font-medium">
              Saldo para consultas: {formatCurrency(dashboardData.receitaGerada)}
            </span>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {dashboardData.alertas.length > 0 && (
        <div className="space-y-2">
          {dashboardData.alertas.map((alerta, index) => (
            <Alert key={index} className={
              alerta.tipo === 'error' ? 'border-red-200 bg-red-50' :
              alerta.tipo === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            }>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{alerta.mensagem}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-teal-500" />
              Próxima Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.proximaConsulta ? (
              <>
                <p className="text-2xl font-bold">{dashboardData.proximaConsulta.data}</p>
                <p className="text-gray-600">{dashboardData.proximaConsulta.horario} - {dashboardData.proximaConsulta.paciente}</p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-teal-500 mt-2" 
                  onClick={() => onOpenConsulta(dashboardData.proximaConsulta!.id)}
                >
                  Ver detalhes
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-500">Nenhuma consulta agendada</p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-teal-500" 
                  onClick={() => navigateToSection('agenda')}
                >
                  Agendar consulta
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Consultas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData.consultasHoje}</p>
            <p className="text-gray-600">
              {dashboardData.consultasSemana} esta semana
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <User className="h-5 w-5 mr-2 text-green-500" />
              Pacientes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData.pacientesAtivos}</p>
            <p className="text-gray-600">
              {dashboardData.consultasMes} consultas este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Coins className="h-5 w-5 mr-2 text-teal-500" />
              Receita Gerada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(dashboardData.receitaGerada)}</p>
            <div className="flex items-center text-green-600 text-sm mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+{dashboardData.consultasMes} consultas</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="agenda" className="mt-6">
        <TabsList>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="consultas">Consultas Recentes</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agenda" className="mt-4">
          <h3 className="text-xl font-bold mb-4">Próximas Consultas</h3>
          {dashboardData.proximaConsulta ? (
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onOpenConsulta(dashboardData.proximaConsulta!.id)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-4">
                    <Clock className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium">{dashboardData.proximaConsulta.paciente}</p>
                    <p className="text-sm text-gray-500">
                      {dashboardData.proximaConsulta.data} às {dashboardData.proximaConsulta.horario}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Ver detalhes
                </Button>
              </CardContent>
            </Card>
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
                  <Button onClick={() => navigateToSection('agenda')}>
                    Agendar consulta
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="consultas" className="mt-4">
          <h3 className="text-xl font-bold mb-4">Consultas Recentes</h3>
          {dashboardData.consultasRecentes.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.consultasRecentes.map(consulta => (
                <Card key={consulta.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{consulta.paciente}</p>
                        <p className="text-sm text-gray-500">
                          {consulta.data} - {consulta.tipo}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          consulta.status === 'realizada' ? 'bg-green-100 text-green-800' :
                          consulta.status === 'agendada' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {consulta.status}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onOpenConsulta(consulta.id)}
                    >
                      Ver Consulta
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
                  <h3 className="text-lg font-medium mb-2">Nenhuma consulta realizada</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Suas consultas realizadas aparecerão aqui.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="financeiro" className="mt-4">
          <h3 className="text-xl font-bold mb-4">Resumo Financeiro</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saldo Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6">
                  <p className="text-4xl font-bold text-teal-600">
                    {formatCurrency(dashboardData.receitaGerada)}
                  </p>
                  <p className="text-gray-500 mt-2">
                    Baseado em {dashboardData.consultasMes} consultas este mês
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas do Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Consultas realizadas:</span>
                    <span className="font-medium">{dashboardData.consultasMes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pacientes únicos:</span>
                    <span className="font-medium">{dashboardData.pacientesAtivos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Valor médio por consulta:</span>
                    <span className="font-medium">
                      {dashboardData.consultasMes > 0 
                        ? formatCurrency(dashboardData.receitaGerada / dashboardData.consultasMes)
                        : formatCurrency(0)
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="mensagens">
          <h3 className="text-xl font-bold mb-4">Mensagens</h3>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Sistema de mensagens em breve</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Em breve você poderá se comunicar diretamente com seus pacientes através desta seção.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardHome;
