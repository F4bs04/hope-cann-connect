
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FilePlus, FileText, Calendar, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Receitas: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('ativas');
  
  const mockReceitas = [
    { 
      id: 1, 
      paciente: 'Maria Silva Santos', 
      medicamento: 'Dipirona 500mg',
      posologia: '1 comprimido a cada 6 horas',
      dataEmissao: new Date(2025, 0, 15),
      dataValidade: new Date(2025, 2, 15),
      status: 'ativa'
    },
    { 
      id: 2, 
      paciente: 'João Oliveira Pereira', 
      medicamento: 'Amitriptilina 25mg',
      posologia: '1 comprimido à noite',
      dataEmissao: new Date(2025, 0, 10),
      dataValidade: new Date(2025, 2, 10),
      status: 'ativa'
    },
    { 
      id: 3, 
      paciente: 'Ana Carolina Souza', 
      medicamento: 'Fluoxetina 20mg',
      posologia: '1 comprimido pela manhã',
      dataEmissao: new Date(2024, 11, 20),
      dataValidade: new Date(2025, 1, 20),
      status: 'expirada'
    }
  ];
  
  const filteredReceitas = mockReceitas.filter(receita => 
    (receita.paciente.toLowerCase().includes(searchQuery.toLowerCase()) ||
    receita.medicamento.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedTab === 'todas' || receita.status === selectedTab)
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Receitas</h1>
        <p className="text-gray-600">
          Visualize e gerencie receitas médicas
        </p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por paciente ou medicamento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button className="bg-[#00B3B0] hover:bg-[#009E9B]">
          <FilePlus className="h-4 w-4 mr-2" /> Nova Receita
        </Button>
      </div>
      
      <Tabs defaultValue="ativas" className="mb-6" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="ativas">Ativas</TabsTrigger>
          <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid gap-4">
        {filteredReceitas.map(receita => {
          const isExpired = receita.status === 'expirada';
          
          return (
            <Card 
              key={receita.id}
              className={`overflow-hidden hover:shadow-md transition-shadow ${isExpired ? 'opacity-70' : ''}`}
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className={`${isExpired ? 'bg-gray-500' : 'bg-[#00B3B0]'} p-4 text-white flex items-center justify-center md:w-16`}>
                    <FileText className="h-8 w-8" />
                  </div>
                  
                  <div className="p-4 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h3 className="font-medium text-lg">{receita.paciente}</h3>
                      {isExpired && (
                        <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">Expirada</span>
                      )}
                    </div>
                    
                    <p className="text-gray-800 font-medium mb-1">{receita.medicamento}</p>
                    <p className="text-gray-600 mb-4 text-sm">{receita.posologia}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        Emissão: {format(receita.dataEmissao, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        Válida até: {format(receita.dataValidade, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 flex flex-row md:flex-col gap-2 justify-center md:w-48">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" /> Visualizar
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" /> Baixar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredReceitas.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Nenhuma receita encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Receitas;
