
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, User, Bell, Clock, FileCheck, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardHomeProps {
  onOpenConsulta: (consultaId: number) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onOpenConsulta }) => {
  const mockConsultas = [
    { id: 1, paciente: 'Maria Silva Santos', data: new Date(2025, 0, 18), horario: '14:30', especialidade: 'Cardiologia' },
    { id: 2, paciente: 'João Oliveira Pereira', data: new Date(2025, 0, 19), horario: '10:00', especialidade: 'Clínica Geral' }
  ];
  
  const mockReceitas = [
    { id: 1, medico: 'Dr. Salomão', data: new Date(2025, 3, 9), paciente: 'Maria Silva Santos' },
    { id: 2, medico: 'Dr. Silva', data: new Date(2025, 3, 2), paciente: 'João Oliveira Pereira' }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo, Dr. João</h1>
          <p className="text-gray-600">Última visita: {format(new Date(2025, 0, 15), 'dd MMM yyyy', { locale: ptBR })}</p>
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
            <p className="text-2xl font-bold">18 Jan 2025</p>
            <p className="text-gray-600">Dr. Silva - Cardiologia</p>
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
            <p className="text-2xl font-bold">3</p>
            <p className="text-gray-600">Última atualização: 10 Jan</p>
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
            <p className="text-2xl font-bold">8</p>
            <p className="text-gray-600">Em 2025</p>
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
          <div className="space-y-4">
            {mockConsultas.map(consulta => (
              <Card key={consulta.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onOpenConsulta(consulta.id)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-4">
                      <Clock className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium">{consulta.paciente}</p>
                      <p className="text-sm text-gray-500">
                        {format(consulta.data, "dd 'de' MMMM', ' yyyy", { locale: ptBR })} - {consulta.horario} - {consulta.especialidade}
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
        </TabsContent>
        
        <TabsContent value="receitas" className="mt-4">
          <h3 className="text-xl font-bold mb-4">Últimas Receitas</h3>
          <div className="space-y-4">
            {mockReceitas.map(receita => (
              <Card key={receita.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Receita para {receita.paciente}</p>
                      <p className="text-sm text-gray-500">Emitida dia {format(receita.data, "dd/MM/yyyy")}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Ver Receita</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="pacientes">
          <h3 className="text-xl font-bold mb-4">Meus Pacientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Maria Silva Santos</p>
                    <p className="text-sm text-gray-500">35 anos</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Última consulta:</span>
                    <span>15/01/2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Condição:</span>
                    <span>Dores nas costas</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">Ver prontuário</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">João Oliveira Pereira</p>
                    <p className="text-sm text-gray-500">42 anos</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Última consulta:</span>
                    <span>10/01/2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Condição:</span>
                    <span>Ansiedade</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">Ver prontuário</Button>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <FileCheck className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium">Maria Silva Santos</p>
                    <p className="text-sm text-gray-500">15/01/2025 - 3 dias</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Ver
                </Button>
              </div>
            </div>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium">Raio-X da coluna lombar</p>
                    <p className="text-sm text-gray-500">Maria Silva Santos - 15/01/2025</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Ver
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium">Hemograma completo</p>
                    <p className="text-sm text-gray-500">João Oliveira Pereira - 10/01/2025</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Ver
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
