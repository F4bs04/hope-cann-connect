
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronDown, ChevronUp, Plus, User, Calendar, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProntuariosProps {
  onSelectPatient: (patientId: number) => void;
}

const Prontuarios: React.FC<ProntuariosProps> = ({ onSelectPatient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const mockPatients = [
    { id: 1, nome: 'Maria Silva Santos', dataUltimaConsulta: '15/01/2025' },
    { id: 2, nome: 'João Oliveira Pereira', dataUltimaConsulta: '10/01/2025' },
    { id: 3, nome: 'Ana Carolina Souza', dataUltimaConsulta: '05/01/2025' }
  ];
  
  const filteredPatients = mockPatients.filter(patient => 
    patient.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prontuário Médico</h1>
        <p className="text-gray-600">
          Visualize e gerencie os prontuários dos seus pacientes
        </p>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Buscar paciente por nome..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <div className="grid gap-4">
        {filteredPatients.map(patient => (
          <Card key={patient.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectPatient(patient.id)}
          >
            <CardContent className="p-4 flex items-center">
              <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                <User className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{patient.nome}</h3>
                <p className="text-sm text-gray-500">Última consulta: {patient.dataUltimaConsulta}</p>
              </div>
              <Button variant="ghost" size="sm">
                Ver prontuário
              </Button>
            </CardContent>
          </Card>
        ))}
        
        {filteredPatients.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">Nenhum paciente encontrado</p>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Prontuário Médico Completo</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="identificacao">
                <AccordionTrigger>Identificação do Paciente</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome Completo</Label>
                      <Input placeholder="Nome do paciente" className="mt-1" />
                    </div>
                    <div>
                      <Label>Idade</Label>
                      <Input type="number" placeholder="Idade" className="mt-1" />
                    </div>
                    <div>
                      <Label>Sexo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="m">Masculino</SelectItem>
                          <SelectItem value="f">Feminino</SelectItem>
                          <SelectItem value="o">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>CID</Label>
                      <Input placeholder="Buscar CID..." className="mt-1" />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="anamnese">
                <AccordionTrigger>Anamnese</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Queixa Principal</Label>
                      <Textarea placeholder="Descreva a queixa principal" className="mt-1" />
                    </div>
                    <div>
                      <Label>História da Doença Atual</Label>
                      <Textarea placeholder="Descreva a história da doença atual" className="mt-1" />
                    </div>
                    <div>
                      <Label>Antecedentes</Label>
                      <Textarea placeholder="Descreva os antecedentes" className="mt-1" />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="diagnostico">
                <AccordionTrigger>Hipóteses Diagnósticas</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input placeholder="Buscar CID..." className="pr-10" />
                      <Button className="absolute right-1 top-1 h-8 w-8 p-0 flex items-center justify-center" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-md">
                      <span className="text-sm">CID J11 - Influenza</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="conduta">
                <AccordionTrigger>Conduta Médica</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Plano Terapêutico</Label>
                      <Textarea placeholder="Descreva o plano terapêutico" className="mt-1" />
                    </div>
                    <div>
                      <Label>Orientações</Label>
                      <Textarea placeholder="Descreva as orientações ao paciente" className="mt-1" />
                    </div>
                    <div>
                      <Label>Encaminhamentos</Label>
                      <Textarea placeholder="Descreva os encaminhamentos" className="mt-1" />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="observacoes">
                <AccordionTrigger>Observações</AccordionTrigger>
                <AccordionContent>
                  <Textarea placeholder="Observações adicionais" className="min-h-[100px]" />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline">Salvar Rascunho</Button>
              <Button>Gerar Resumo para Paciente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Prontuarios;
