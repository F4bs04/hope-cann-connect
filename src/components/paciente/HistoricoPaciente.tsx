
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, User, Calendar, Clock, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface HistoricoConsulta {
  id: number;
  data: Date;
  medico: {
    id: number;
    nome: string;
    especialidade: string;
  };
  motivo: string;
  diagnostico: string;
  tratamento: string;
  observacoes?: string;
}

interface Acompanhamento {
  id: number;
  data: Date;
  sintomas: string;
  eficacia: string;
  efeitos_colaterais?: string;
  notas?: string;
}

const HistoricoPaciente: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [consultas, setConsultas] = useState<HistoricoConsulta[]>([]);
  const [acompanhamentos, setAcompanhamentos] = useState<Acompanhamento[]>([]);
  
  // Dados mockados - em um aplicativo real, viriam do banco de dados
  useEffect(() => {
    setTimeout(() => {
      setConsultas([
        {
          id: 1,
          data: new Date(2025, 3, 15),
          medico: {
            id: 2,
            nome: 'Dr. Ricardo Silva',
            especialidade: 'Neurologia',
          },
          motivo: 'Dores crônicas nas costas',
          diagnostico: 'Dor neuropática crônica',
          tratamento: 'Prescrição de óleo de CBD 100mg/ml - 1 gota sublingual, 2x ao dia',
          observacoes: 'Paciente deve retornar em 30 dias para avaliação da resposta ao tratamento'
        },
        {
          id: 2,
          data: new Date(2025, 2, 10),
          medico: {
            id: 3,
            nome: 'Dra. Amanda Oliveira',
            especialidade: 'Clínica Geral',
          },
          motivo: 'Acompanhamento de tratamento para dores crônicas',
          diagnostico: 'Dor neuropática crônica com resposta parcial ao tratamento',
          tratamento: 'Ajuste de dosagem para óleo de CBD 100mg/ml - 2 gotas sublingual, 2x ao dia',
          observacoes: 'Paciente relatou melhora de 30% nas dores. Continuar monitoramento.'
        }
      ]);
      
      setAcompanhamentos([
        {
          id: 1,
          data: new Date(2025, 3, 22),
          sintomas: 'Dor nas costas com intensidade 6/10',
          eficacia: 'Redução moderada da dor após o uso do medicamento',
          efeitos_colaterais: 'Leve sonolência pela manhã',
          notas: 'A dor está menos intensa à noite, facilitando o sono'
        },
        {
          id: 2,
          data: new Date(2025, 3, 29),
          sintomas: 'Dor nas costas com intensidade 5/10',
          eficacia: 'Melhora gradual com o uso contínuo',
          efeitos_colaterais: 'Sonolência diminuiu',
          notas: 'Conseguindo fazer caminhadas curtas sem dor intensa'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddAcompanhamento = () => {
    // Em um aplicativo real, abriria um formulário para registrar o acompanhamento
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "O registro de acompanhamento será disponibilizado em breve.",
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
      <h2 className="text-xl font-semibold mb-4">Seu Histórico Médico</h2>
      
      <Tabs defaultValue="consultas">
        <TabsList className="mb-4">
          <TabsTrigger value="consultas">Consultas</TabsTrigger>
          <TabsTrigger value="acompanhamentos">Acompanhamentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="consultas">
          {consultas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma consulta encontrada</h3>
                <p className="text-gray-500 mb-4">
                  Você ainda não possui consultas registradas em seu histórico.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {consultas.map((consulta) => (
                <AccordionItem key={consulta.id} value={`item-${consulta.id}`} className="bg-white border rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex-1 flex justify-between items-center">
                      <div className="text-left">
                        <p className="font-medium">{consulta.motivo}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{format(new Date(consulta.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center text-sm text-gray-500">
                        <User className="h-3 w-3 mr-1" />
                        <span>{consulta.medico.nome} - {consulta.medico.especialidade}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3 text-sm">
                      <div className="md:hidden flex items-center text-gray-600 mb-2">
                        <User className="h-4 w-4 mr-1" />
                        <span>{consulta.medico.nome} - {consulta.medico.especialidade}</span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Diagnóstico:</h4>
                        <p className="text-gray-700">{consulta.diagnostico}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Tratamento:</h4>
                        <p className="text-gray-700">{consulta.tratamento}</p>
                      </div>
                      
                      {consulta.observacoes && (
                        <div>
                          <h4 className="font-medium">Observações:</h4>
                          <p className="text-gray-700">{consulta.observacoes}</p>
                        </div>
                      )}
                      
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>
        
        <TabsContent value="acompanhamentos">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Registros de Acompanhamento</h3>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={handleAddAcompanhamento}
            >
              <PlusCircle className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
          
          {acompanhamentos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum acompanhamento registrado</h3>
                <p className="text-gray-500 mb-4">
                  Registre o acompanhamento do seu tratamento para um melhor monitoramento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {acompanhamentos.map((acomp) => (
                <Card key={acomp.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-hopecann-teal" />
                        {format(new Date(acomp.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium">Sintomas:</p>
                        <p className="text-gray-700">{acomp.sintomas}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Eficácia do tratamento:</p>
                        <p className="text-gray-700">{acomp.eficacia}</p>
                      </div>
                      
                      {acomp.efeitos_colaterais && (
                        <div>
                          <p className="font-medium">Efeitos colaterais:</p>
                          <p className="text-gray-700">{acomp.efeitos_colaterais}</p>
                        </div>
                      )}
                      
                      {acomp.notas && (
                        <div>
                          <p className="font-medium">Notas adicionais:</p>
                          <p className="text-gray-700">{acomp.notas}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HistoricoPaciente;
