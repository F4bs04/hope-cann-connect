
// Updated imports for exam templates
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, FileText, Check, Save, BookmarkPlus, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getPacientes, createPedidoExame } from '@/services/supabaseService';
import { getTemplatesExame, updateTemplateUsage } from '@/services/exames/examesService';
import PdfUpload from '@/components/ui/pdf-upload';
import ExameTemplateItem from './ExameTemplateItem';
import SaveTemplateDialog from './SaveTemplateDialog';
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';

const PedidosExame: React.FC = () => {
  const { toast } = useToast();
  const { userInfo } = useCurrentUserInfo();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [assinado, setAssinado] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('formulario');
  const [medicoUserId, setMedicoUserId] = useState<number | null>(null);
  const [pdfFilePath, setPdfFilePath] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');

  // Form state
  const [pacienteId, setPacienteId] = useState('');
  const [nomeExame, setNomeExame] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [prioridade, setPrioridade] = useState('rotina');
  const [instrucoes, setInstrucoes] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setLoadingTemplates(true);
      
      // Carregar pacientes
      const data = await getPacientes();
      setPacientes(data);
      setLoading(false);
      
      // Carregar ID do médico do localStorage
      const userId = userInfo?.medicoId || localStorage.getItem("userId");
      if (userId) {
        setMedicoUserId(typeof userId === 'string' ? parseInt(userId) : userId);
        
        // Carregar templates
        const templatesData = await getTemplatesExame(typeof userId === 'string' ? parseInt(userId) : userId);
        setTemplates(templatesData);
        setLoadingTemplates(false);
      }
    };
    
    loadData();
  }, [userInfo]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se estamos na aba de anexo PDF e temos um arquivo anexado
    if (activeTab === 'pdf' && pdfFilePath) {
      if (!pacienteId) {
        toast({
          variant: "destructive",
          title: "Paciente obrigatório",
          description: "Por favor, selecione um paciente para associar ao PDF",
        });
        return;
      }
      
      const pedidoData = {
        id_paciente: parseInt(pacienteId),
        nome_exame: "Pedido de exame via PDF",
        justificativa: "Ver documento PDF anexado",
        prioridade: prioridade,
        instrucoes: instrucoes || "Ver documento anexo",
        assinado: true,
        arquivo_pdf: pdfFilePath
      };
      
      const newPedido = await createPedidoExame(pedidoData);
      
      if (newPedido) {
        setSuccess(true);
      }
      
      return;
    }
    
    // Validações para o formulário
    if (!pacienteId) {
      toast({
        variant: "destructive",
        title: "Paciente obrigatório",
        description: "Por favor, selecione um paciente",
      });
      return;
    }
    
    if (!nomeExame) {
      toast({
        variant: "destructive",
        title: "Nome do exame obrigatório",
        description: "Por favor, insira o nome do exame",
      });
      return;
    }
    
    if (!justificativa) {
      toast({
        variant: "destructive",
        title: "Justificativa obrigatória",
        description: "Por favor, insira a justificativa clínica",
      });
      return;
    }
    
    if (!assinado) {
      toast({
        variant: "destructive",
        title: "Assinatura obrigatória",
        description: "Por favor, assine digitalmente o pedido de exame",
      });
      return;
    }
    
    const pedidoData = {
      id_paciente: parseInt(pacienteId),
      nome_exame: nomeExame,
      justificativa,
      prioridade,
      instrucoes,
      assinado: true
    };
    
    const newPedido = await createPedidoExame(pedidoData);
    
    if (newPedido) {
      setSuccess(true);
    }
  };
  
  const handlePdfUploadComplete = (filePath: string) => {
    setPdfFilePath(filePath);
  };
  
  const handleSelectTemplate = async (template: any) => {
    setNomeExame(template.nome_exame);
    setJustificativa(template.justificativa);
    setPrioridade(template.prioridade);
    setInstrucoes(template.instrucoes);
    
    // Incrementar contador de uso
    if (template.id) {
      await updateTemplateUsage(template.id);
      // Atualizar a lista de templates
      if (medicoUserId) {
        const updatedTemplates = await getTemplatesExame(medicoUserId);
        setTemplates(updatedTemplates);
      }
    }
    
    toast({
      title: "Template aplicado",
      description: "Os dados do template foram aplicados ao formulário",
    });
  };
  
  const handleDeleteTemplate = async (id: number) => {
    // Remover da UI imediatamente
    setTemplates(templates.filter(t => t.id !== id));
  };
  
  const refreshTemplates = async () => {
    if (medicoUserId) {
      setLoadingTemplates(true);
      const updatedTemplates = await getTemplatesExame(medicoUserId);
      setTemplates(updatedTemplates);
      setLoadingTemplates(false);
    }
  };
  
  const filteredTemplates = templates.filter(template => 
    template.nome.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
    template.nome_exame.toLowerCase().includes(templateSearchQuery.toLowerCase())
  );
  
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-green-100 rounded-full p-4 mb-4">
          <Check className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Pedido de Exame Gerado</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          O pedido de exame foi gerado com sucesso e está disponível para impressão ou download.
        </p>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            size="lg"
            className="flex items-center"
            onClick={() => window.print()}
          >
            <FileText className="mr-2 h-5 w-5" />
            Imprimir Pedido
          </Button>
          <Button 
            size="lg"
            onClick={() => {
              setPacienteId('');
              setNomeExame('');
              setJustificativa('');
              setPrioridade('rotina');
              setInstrucoes('');
              setAssinado(false);
              setSuccess(false);
              setPdfFilePath(null);
              setActiveTab('formulario');
            }}
          >
            Criar Novo Pedido
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pedido de Exame</h1>
        <p className="text-gray-600">
          Preencha os dados para solicitar exames para seus pacientes
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
          <TabsTrigger value="formulario">Preencher Formulário</TabsTrigger>
          <TabsTrigger value="pdf">Anexar PDF</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="paciente" className="font-medium">
                    Paciente*
                  </Label>
                  <Select value={pacienteId} onValueChange={setPacienteId} required>
                    <SelectTrigger id="paciente" className="mt-1">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {pacientes.map(paciente => (
                        <SelectItem key={paciente.id} value={paciente.id.toString()}>
                          {paciente.nome} ({paciente.idade} anos)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {activeTab === 'formulario' ? (
                  <>
                    <div>
                      <Label htmlFor="nome-exame" className="font-medium">
                        Nome do Exame
                      </Label>
                      <Input
                        id="nome-exame"
                        placeholder="Nome do exame"
                        value={nomeExame}
                        onChange={(e) => setNomeExame(e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="justificativa" className="font-medium">
                        Justificativa Clínica
                      </Label>
                      <Textarea
                        id="justificativa"
                        placeholder="Descreva a justificativa clínica para o exame"
                        value={justificativa}
                        onChange={(e) => setJustificativa(e.target.value)}
                        className="mt-1 min-h-[120px]"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label className="font-medium">
                        Nível de Prioridade
                      </Label>
                      <RadioGroup
                        value={prioridade}
                        onValueChange={setPrioridade}
                        className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4"
                      >
                        <div className="flex items-center space-x-2 p-3 border rounded-md bg-red-50 hover:bg-red-100 cursor-pointer">
                          <RadioGroupItem value="urgente" id="urgente" className="text-red-500" />
                          <Label htmlFor="urgente" className="cursor-pointer flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                            <span>Urgente</span>
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 p-3 border rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer">
                          <RadioGroupItem value="rotina" id="rotina" />
                          <Label htmlFor="rotina" className="cursor-pointer">Rotina</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 p-3 border rounded-md bg-blue-50 hover:bg-blue-100 cursor-pointer">
                          <RadioGroupItem value="acompanhamento" id="acompanhamento" className="text-blue-500" />
                          <Label htmlFor="acompanhamento" className="cursor-pointer">Acompanhamento</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <Label htmlFor="instrucoes" className="font-medium">
                        Instruções ao Paciente
                      </Label>
                      <Input
                        id="instrucoes"
                        placeholder="Digite as instruções..."
                        value={instrucoes}
                        onChange={(e) => setInstrucoes(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="font-medium">
                        Assinatura Digital
                      </Label>
                      <div 
                        className={`border-2 ${assinado ? 'border' : 'border-dashed'} rounded-md p-8 mt-1 flex flex-col items-center justify-center text-center ${assinado ? 'bg-green-50 border-green-200' : 'text-gray-500 hover:bg-gray-50'} cursor-pointer`}
                        onClick={() => setAssinado(!assinado)}
                      >
                        {assinado ? (
                          <>
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                              <Check className="h-6 w-6 text-green-600" />
                            </div>
                            <span className="text-green-800 font-medium">Documento assinado digitalmente</span>
                          </>
                        ) : (
                          <>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 text-gray-400">
                              <path d="M15.5 8.5C15.5 8.5 15 11 12 11M12 11C9 11 8.5 8.5 8.5 8.5M12 11V15.5M7 16.5H17M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Clique para assinar digitalmente</span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="font-medium">
                        Nível de Prioridade
                      </Label>
                      <RadioGroup
                        value={prioridade}
                        onValueChange={setPrioridade}
                        className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4"
                      >
                        <div className="flex items-center space-x-2 p-3 border rounded-md bg-red-50 hover:bg-red-100 cursor-pointer">
                          <RadioGroupItem value="urgente" id="urgente-pdf" className="text-red-500" />
                          <Label htmlFor="urgente-pdf" className="cursor-pointer flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                            <span>Urgente</span>
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 p-3 border rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer">
                          <RadioGroupItem value="rotina" id="rotina-pdf" />
                          <Label htmlFor="rotina-pdf" className="cursor-pointer">Rotina</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 p-3 border rounded-md bg-blue-50 hover:bg-blue-100 cursor-pointer">
                          <RadioGroupItem value="acompanhamento" id="acompanhamento-pdf" className="text-blue-500" />
                          <Label htmlFor="acompanhamento-pdf" className="cursor-pointer">Acompanhamento</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <Label htmlFor="instrucoes-pdf" className="font-medium">
                        Instruções ao Paciente
                      </Label>
                      <Input
                        id="instrucoes-pdf"
                        placeholder="Digite as instruções..."
                        value={instrucoes}
                        onChange={(e) => setInstrucoes(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <PdfUpload 
                      onUploadComplete={handlePdfUploadComplete} 
                      userId={medicoUserId} 
                      pacienteId={pacienteId ? parseInt(pacienteId) : null}
                      docType="pedido_exame"
                    />
                  </>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setTemplateDialogOpen(true)}
                    disabled={activeTab === 'pdf' || !nomeExame || !justificativa}
                    className="flex items-center"
                  >
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Salvar Template
                  </Button>
                
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={(activeTab === 'formulario' && !assinado) || (activeTab === 'pdf' && !pdfFilePath)}
                  >
                    Gerar Pedido de Exame
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <div className="sticky top-4 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Templates Salvos</h3>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      placeholder="Buscar..."
                      value={templateSearchQuery}
                      onChange={(e) => setTemplateSearchQuery(e.target.value)}
                      className="pl-7 h-8 text-sm"
                    />
                  </div>
                </div>
                
                {loadingTemplates ? (
                  <div className="text-center py-6 text-gray-500">
                    Carregando templates...
                  </div>
                ) : filteredTemplates.length > 0 ? (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {filteredTemplates.map(template => (
                      <ExameTemplateItem
                        key={template.id}
                        template={template}
                        onSelect={handleSelectTemplate}
                        onDelete={handleDeleteTemplate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    {templateSearchQuery ? (
                      <p>Nenhum template encontrado para "{templateSearchQuery}"</p>
                    ) : (
                      <p>Você ainda não tem templates salvos</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Exames Frequentes</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-left" onClick={() => setNomeExame("Hemograma completo")}>
                    Hemograma completo
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left" onClick={() => setNomeExame("Raio-X da coluna lombar")}>
                    Raio-X da coluna lombar
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left" onClick={() => setNomeExame("Exames de sangue de rotina")}>
                    Exames de sangue de rotina
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left" onClick={() => setNomeExame("Eletrocardiograma")}>
                    Eletrocardiograma
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <SaveTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        formData={{
          nomeExame,
          justificativa,
          prioridade,
          instrucoes
        }}
        medicoId={medicoUserId}
        onSuccess={refreshTemplates}
      />
    </div>
  );
};

export default PedidosExame;
