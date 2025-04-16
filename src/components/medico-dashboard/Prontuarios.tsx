
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, FileText, Calendar, User, Clock, X as XIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PatientRecord {
  id: number;
  nome: string;
  idade: number;
  dataConsulta: string;
  status: 'concluído' | 'pendente' | 'cancelado';
  sintomas: string;
  diagnostico: string;
  tratamento: string;
}

const mockProntuarios: PatientRecord[] = [
  {
    id: 1,
    nome: 'Maria Silva Santos',
    idade: 35,
    dataConsulta: '15/01/2025',
    status: 'concluído',
    sintomas: 'Dores nas costas, dificuldade para dormir',
    diagnostico: 'Lombalgia crônica',
    tratamento: 'CBD 20mg 2x ao dia'
  },
  {
    id: 2,
    nome: 'João Oliveira Pereira',
    idade: 42,
    dataConsulta: '10/01/2025',
    status: 'concluído',
    sintomas: 'Ansiedade, insônia',
    diagnostico: 'Transtorno de Ansiedade Generalizada',
    tratamento: 'CBD 30mg à noite'
  },
  {
    id: 3,
    nome: 'Ana Carolina Souza',
    idade: 28,
    dataConsulta: '05/01/2025',
    status: 'cancelado',
    sintomas: 'Enxaqueca frequente',
    diagnostico: 'Enxaqueca crônica',
    tratamento: 'THC/CBD 1:1 10mg em crises'
  }
];

interface ProntuariosProps {
  onSelectPatient: (patientId: number) => void;
}

const Prontuarios: React.FC<ProntuariosProps> = ({ onSelectPatient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  
  const filteredProntuarios = mockProntuarios.filter(prontuario => 
    prontuario.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prontuario.diagnostico.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(prontuario => {
    if (activeTab === 'todos') return true;
    if (activeTab === 'concluido') return prontuario.status === 'concluído';
    if (activeTab === 'pendente') return prontuario.status === 'pendente';
    if (activeTab === 'cancelado') return prontuario.status === 'cancelado';
    return true;
  });
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prontuários</h1>
        <p className="text-gray-600">
          Histórico médico e evolução dos pacientes
        </p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar prontuário por paciente ou diagnóstico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button className="bg-[#00B3B0] hover:bg-[#009E9B]">
          <Plus className="h-4 w-4 mr-2" /> Novo Prontuário
        </Button>
      </div>
      
      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="concluido">Concluídos</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="cancelado">Cancelados</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid gap-4">
        {filteredProntuarios.map(prontuario => (
          <Card 
            key={prontuario.id}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectPatient(prontuario.id)}
          >
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div 
                  className={`
                    p-4 text-white flex items-center justify-center md:w-16
                    ${prontuario.status === 'concluído' ? 'bg-green-500' : 
                      prontuario.status === 'pendente' ? 'bg-amber-500' : 
                      'bg-red-500'}
                  `}
                >
                  <FileText className="h-8 w-8" />
                </div>
                
                <div className="p-4 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <div className="flex items-center">
                      <h3 className="font-medium text-lg">{prontuario.nome}</h3>
                      <span className="text-sm text-gray-500 ml-4">{prontuario.idade} anos</span>
                    </div>
                    <div 
                      className={`
                        text-xs px-2 py-1 rounded-full mt-2 md:mt-0 inline-block
                        ${prontuario.status === 'concluído' ? 'bg-green-100 text-green-700' : 
                          prontuario.status === 'pendente' ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'}
                      `}
                    >
                      {prontuario.status.charAt(0).toUpperCase() + prontuario.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Diagnóstico:</span> {prontuario.diagnostico}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">Tratamento:</span> {prontuario.tratamento}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Consulta: {prontuario.dataConsulta}
                    </div>
                    <div className="flex items-center">
                      <User className="h-3.5 w-3.5 mr-1" />
                      Paciente #{prontuario.id}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Última atualização: {prontuario.dataConsulta}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 flex flex-col gap-2 justify-center md:w-48">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle edit here
                    }}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPatient(prontuario.id);
                    }}
                  >
                    Ver detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredProntuarios.length === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-lg border">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-1">Nenhum prontuário encontrado</h3>
            <p className="text-gray-500 mb-4">Não encontramos prontuários com esses critérios de busca</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setActiveTab('todos');
              }}
              className="mx-auto"
            >
              <XIcon className="h-4 w-4 mr-2" /> Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prontuarios;
