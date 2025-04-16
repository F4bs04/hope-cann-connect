
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Download, Printer, User, Calendar, Clock, FileText, CheckSquare, FileSearch } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConsultaViewProps {
  consultaId: number;
  onBack: () => void;
}

const ConsultaView: React.FC<ConsultaViewProps> = ({ consultaId, onBack }) => {
  // This would normally be fetched from the database
  const consulta = {
    id: consultaId,
    paciente: 'Maria Silva Santos',
    data: new Date(2025, 0, 15),
    horario: '14:30',
    motivo: 'Dores nas costas e fadiga persistente há 2 semanas',
    informacoes: [
      'Paciente relata dores na região lombar',
      'Sensação de cansaço durante o dia',
      'Sem alterações significativas na pressão arterial',
      'Exame físico sem alterações importantes'
    ],
    recomendacoes: [
      'Realizar exercícios leves de alongamento diariamente',
      'Manter boa postura durante o trabalho',
      'Dormir 8 horas por noite'
    ],
    medicacoes: [
      { nome: 'Anti-inflamatório', dosagem: '1 comprimido, 2x ao dia', duracao: '5 dias' },
      { nome: 'Relaxante muscular', dosagem: '1 comprimido à noite', duracao: '7 dias' }
    ],
    exames: [
      { nome: 'Raio-X da coluna lombar', status: 'pendente' },
      { nome: 'Hemograma completo', status: 'pendente' }
    ],
    proximaConsulta: new Date(2025, 0, 29)
  };

  return (
    <div>
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para agenda
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Registro Médico</h1>
          <div className="flex flex-col md:flex-row gap-4 text-gray-700">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium">{consulta.paciente}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <span>{format(consulta.data, "dd 'de' MMMM', ' yyyy", { locale: ptBR })}</span>
            </div>
          </div>
        </div>
        
        <div className="flex mt-4 md:mt-0 gap-2">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" /> Enviar Email
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Motivo da Consulta</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{consulta.motivo}</p>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {consulta.informacoes.map((info, index) => (
              <li key={index} className="flex items-start">
                <span className="h-5 w-5 bg-blue-100 rounded-full text-blue-600 flex items-center justify-center mr-3 flex-shrink-0 text-xs mt-0.5">
                  i
                </span>
                {info}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recomendações de Saúde</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {consulta.recomendacoes.map((recomendacao, index) => (
              <li key={index} className="flex items-start">
                <CheckSquare className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                {recomendacao}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-yellow-50 border-yellow-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2 text-yellow-600" />
              Medicações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {consulta.medicacoes.map((medicacao, index) => (
                <li key={index} className="border-b border-yellow-100 pb-3 last:border-0 last:pb-0">
                  <p className="font-medium text-yellow-900">• {medicacao.nome}: {medicacao.dosagem}</p>
                  <p className="text-sm text-yellow-800 mt-1">Por {medicacao.duracao}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileSearch className="h-5 w-5 mr-2 text-blue-600" />
              Exames Solicitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {consulta.exames.map((exame, index) => (
                <li key={index} className="border-b border-blue-100 pb-3 last:border-0 last:pb-0">
                  <p className="font-medium text-blue-900">• {exame.nome}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-blue-600 capitalize">{exame.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-orange-50 border-orange-100">
        <CardContent className="p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-orange-600" />
            <span className="font-medium text-orange-800">Próximos Passos</span>
          </div>
          
          <div className="mt-4 flex items-center border border-orange-200 rounded-md p-3 bg-white">
            <Calendar className="h-5 w-5 mr-3 text-orange-500" />
            <div>
              <p className="font-medium">Retorno agendado para: {format(consulta.proximaConsulta, "dd 'de' MMMM', ' yyyy", { locale: ptBR })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultaView;
