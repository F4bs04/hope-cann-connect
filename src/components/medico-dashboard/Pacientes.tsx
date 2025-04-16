
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, User, Calendar, Phone, Mail, Clock } from 'lucide-react';

interface PacientesProps {
  onSelectPatient: (patientId: number) => void;
}

const Pacientes: React.FC<PacientesProps> = ({ onSelectPatient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const mockPatients = [
    { 
      id: 1, 
      nome: 'Maria Silva Santos', 
      idade: 35, 
      condicao: 'Dores nas costas',
      telefone: '(11) 98765-4321',
      email: 'maria.silva@email.com',
      ultimaConsulta: '15/01/2025'
    },
    { 
      id: 2, 
      nome: 'João Oliveira Pereira', 
      idade: 42, 
      condicao: 'Ansiedade',
      telefone: '(11) 91234-5678',
      email: 'joao.oliveira@email.com',
      ultimaConsulta: '10/01/2025'
    },
    { 
      id: 3, 
      nome: 'Ana Carolina Souza', 
      idade: 28, 
      condicao: 'Enxaqueca',
      telefone: '(11) 99876-5432',
      email: 'ana.carolina@email.com',
      ultimaConsulta: '05/01/2025'
    }
  ];
  
  const filteredPatients = mockPatients.filter(patient => 
    patient.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.condicao.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pacientes</h1>
        <p className="text-gray-600">
          Gerencie seus pacientes e histórico de consultas
        </p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar paciente por nome ou condição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button className="bg-[#00B3B0] hover:bg-[#009E9B]">
          <UserPlus className="h-4 w-4 mr-2" /> Novo Paciente
        </Button>
      </div>
      
      <div className="grid gap-4">
        {filteredPatients.map(patient => (
          <Card 
            key={patient.id}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectPatient(patient.id)}
          >
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="bg-[#00B3B0] p-4 text-white flex items-center justify-center md:w-16">
                  <User className="h-8 w-8" />
                </div>
                
                <div className="p-4 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h3 className="font-medium text-lg">{patient.nome}</h3>
                    <span className="text-sm text-gray-500 md:ml-4">{patient.idade} anos</span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{patient.condicao}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {patient.telefone}
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {patient.email}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      Última consulta: {patient.ultimaConsulta}
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
                      // Handle scheduling here
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" /> Agendar
                  </Button>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPatient(patient.id);
                    }}
                  >
                    Ver prontuário
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredPatients.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">Nenhum paciente encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pacientes;
