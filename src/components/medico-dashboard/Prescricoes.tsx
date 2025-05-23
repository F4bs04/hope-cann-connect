
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Check, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPacientes, createReceita } from '@/services/supabaseService';
import PdfUpload from '@/components/ui/pdf-upload';
import { generatePrescricaoPDF, downloadPDF } from '@/services/pdfDirectService';
import { format } from 'date-fns';
import TemplateReceita from '@/components/receita/TemplateReceita';
import ReceitaPreview from '@/components/receita/ReceitaPreview';

const Prescricoes: React.FC = () => {
  const { toast } = useToast();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('formulario');
  const [medicoUserId, setMedicoUserId] = useState<number | null>(null);
  const [pdfFilePath, setPdfFilePath] = useState<string | null>(null);
  const [pacienteInfo, setPacienteInfo] = useState<any>(null);
  const [medicoInfo, setMedicoInfo] = useState({ nome: '', crm: '', especialidade: '' });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDataValidade, setPreviewDataValidade] = useState<Date | null>(null);

  // Form state
  const [pacienteId, setPacienteId] = useState('');
  const [medicamento, setMedicamento] = useState('');
  const [posologia, setPosologia] = useState('');
  const [tempoUso, setTempoUso] = useState('');
  const [periodo, setPeriodo] = useState('dias');
  const [permiteSubstituicao, setPermiteSubstituicao] = useState('não');
  const [cid, setCid] = useState('');
  const [tipoReceita, setTipoReceita] = useState('simples');
  const [observacoes, setObservacoes] = useState('');
  const [assinado, setAssinado] = useState(false);
  
  useEffect(() => {
    const loadPacientes = async () => {
      setLoading(true);
      const data = await getPacientes();
      setPacientes(data);
      setLoading(false);
    };
    
    loadPacientes();
    
    // Carregar ID do médico do localStorage
    const userId = localStorage.getItem("userId");
    if (userId) {
      setMedicoUserId(parseInt(userId));
    }
  }, []);
  
  // Efeito para carregar informações do médico
  useEffect(() => {
    // Aqui você deveria carregar as informações do médico da sua API
    // Por enquanto, vamos simular com dados estáticos
    const loadMedicoInfo = async () => {
      setMedicoInfo({
        nome: 'Dr. João Silva',
        crm: '12345-SP',
        especialidade: 'Clínica Médica'
      });
    };
    
    if (medicoUserId) {
      loadMedicoInfo();
    }
  }, [medicoUserId]);
  
  // Efeito para carregar informações do paciente selecionado
  useEffect(() => {
    if (pacienteId && pacientes.length > 0) {
      const selected = pacientes.find(p => p.id.toString() === pacienteId);
      if (selected) {
        setPacienteInfo(selected);
      }
    }
  }, [pacienteId, pacientes]);
  
  const handleShowPreview = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!pacienteId) {
      toast({
        variant: "destructive",
        title: "Paciente obrigatório",
        description: "Por favor, selecione um paciente.",
      });
      return;
    }
    
    if (!medicamento || !posologia) {
      toast({
        variant: "destructive",
        title: "Informações incompletas",
        description: "Por favor, preencha o medicamento e a posologia.",
      });
      return;
    }
    
    if (!assinado) {
      toast({
        variant: "destructive",
        title: "Assinatura necessária",
        description: "Por favor, assine a receita antes de gerá-la.",
      });
      return;
    }
    
    // Calcular data de validade
    const dataValidade = new Date();
    const dias = parseInt(tempoUso);
    if (!isNaN(dias)) {
      if (periodo === 'dias') {
        dataValidade.setDate(dataValidade.getDate() + dias);
      } else if (periodo === 'semanas') {
        dataValidade.setDate(dataValidade.getDate() + dias * 7);
      } else if (periodo === 'meses') {
        dataValidade.setMonth(dataValidade.getMonth() + dias);
      }
    } else {
      dataValidade.setDate(dataValidade.getDate() + 30); // Padrão: 30 dias
    }
    
    // Salvar a data de validade para usar na prévia
    setPreviewDataValidade(dataValidade);
    
    // Mostrar a prévia da receita
    setShowPreview(true);
  };
  
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
      
      // Calcular data de validade para PDF (30 dias)
      const dataValidade = new Date();
      dataValidade.setDate(dataValidade.getDate() + 30);
      
      // Criar receita com referência ao PDF
      const receitaData = {
        id_paciente: parseInt(pacienteId),
        medicamento: "Receita via PDF anexado",
        posologia: "Ver documento anexo",
        observacoes: `Documento anexado: ${pdfFilePath}`,
        data_validade: dataValidade,
      };
      
      try {
        await createReceita(receitaData);
        setSuccess(true);
        resetForm();
        setShowPreview(false);
      } catch (error) {
        console.error("Erro ao criar receita:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao criar a receita.",
        });
      }
      return;
    }

    // Verificar se temos a data de validade calculada
    if (!previewDataValidade) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, visualize a prévia novamente antes de gerar a receita.",
      });
      return;
    }
    
    // Criar objeto da receita para salvar
    // Note que estamos incluindo apenas os campos que existem no banco de dados
    const receitaData = {
      id_paciente: parseInt(pacienteId),
      medicamento,
      posologia,
      // Incluir informações adicionais nas observações, já que alguns campos não existem no BD
      observacoes: `${observacoes ? observacoes + '\n\n' : ''}Tempo de uso: ${tempoUso} ${periodo}. ${cid ? `CID: ${cid}.` : ''} ${permiteSubstituicao === 'sim' ? 'Permite substituição do medicamento.' : 'Não permite substituição do medicamento.'}`,
      tipo_receita: tipoReceita,
      data_validade: previewDataValidade,
    };
    
    try {
      await createReceita(receitaData);
      setSuccess(true);
      resetForm();
      setShowPreview(false);
    } catch (error) {
      console.error("Erro ao criar receita:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao gerar a receita.",
      });
    }
  };
  
  // Função para gerar o PDF diretamente
  const handleGeneratePDF = async () => {
    // Verifica se temos as informações necessárias
    if (!pacienteInfo) {
      toast({
        variant: "destructive",
        title: "Informações incompletas",
        description: "Informações do paciente não disponíveis para gerar o PDF."
      });
      return null;
    }
    
    try {
      setIsGeneratingPDF(true);
      
      // Calcular data de validade
      const dataValidade = new Date();
      const dias = parseInt(tempoUso);
      if (!isNaN(dias)) {
        if (periodo === 'dias') {
          dataValidade.setDate(dataValidade.getDate() + dias);
        } else if (periodo === 'semanas') {
          dataValidade.setDate(dataValidade.getDate() + dias * 7);
        } else if (periodo === 'meses') {
          dataValidade.setMonth(dataValidade.getMonth() + dias);
        }
      } else {
        dataValidade.setDate(dataValidade.getDate() + 30); // Padrão: 30 dias
      }
      
      // Gerar o PDF usando nossa função de geração direta
      const prescricaoData = {
        paciente: pacienteInfo,
        medico: medicoInfo,
        receita: {
          medicamento,
          posologia,
          tempoUso,
          periodo,
          permiteSubstituicao,
          cid,
          tipoReceita,
          observacoes,
          data_criacao: new Date(),
          data_validade: dataValidade
        }
      };
      
      console.log('Gerando PDF com dados:', prescricaoData);
      const blob = generatePrescricaoPDF(prescricaoData);
      
      toast({
        title: "PDF gerado",
        description: "A receita em PDF foi gerada com sucesso e está pronta para download.",
      });
      
      return blob;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível gerar o PDF da receita. Erro: " + (error as Error).message,
      });
      return null;
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  // Função para baixar o PDF
  const handleDownloadPDF = async () => {
    // Gerar o PDF diretamente ao clicar no botão de download
    const blob = await handleGeneratePDF();
    if (!blob) return;
    
    // Configurar o nome do arquivo
    const pacienteName = pacienteInfo?.nome || 'paciente';
    const date = format(new Date(), 'yyyyMMdd');
    const filename = `Prescricao_${pacienteName.replace(/\s+/g, '_')}_${date}.pdf`;
    
    // Iniciar o download usando nossa função de download direta
    downloadPDF(blob, filename);
    
    toast({
      title: "Download iniciado",
      description: "O PDF foi baixado com sucesso.",
    });
  };
  
  const resetForm = () => {
    setPacienteId('');
    setMedicamento('');
    setPosologia('');
    setTempoUso('');
    setPeriodo('dias');
    setPermiteSubstituicao('não');
    setCid('');
    setTipoReceita('simples');
    setObservacoes('');
    setAssinado(false);
    setPdfFilePath(null);
    setActiveTab('formulario');
  };
  
  const handlePdfUploadComplete = (filePath: string) => {
    setPdfFilePath(filePath);
  };
  
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-green-100 rounded-full p-4 mb-4">
          <Check className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Receita Gerada com Sucesso</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          A receita foi gerada e está disponível para impressão ou download.
        </p>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            size="lg"
            className="flex items-center"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-5 w-5" />
            Imprimir Receita
          </Button>
          <Button 
            size="lg"
            onClick={() => setSuccess(false)}
          >
            Criar Nova Receita
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prescrição Digital</h1>
        <p className="text-gray-600">
          Sistema integrado com ANVISA
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl mx-auto mb-6">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="formulario">Preencher Formulário</TabsTrigger>
          <TabsTrigger value="pdf">Anexar PDF</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card className="max-w-2xl mx-auto">
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
                  <Label htmlFor="medicamento" className="font-medium">
                    Nome do Medicamento*
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="medicamento"
                      placeholder="Digite o nome do medicamento"
                      value={medicamento}
                      onChange={(e) => setMedicamento(e.target.value)}
                      className="pr-8"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="posologia" className="font-medium">
                    Posologia*
                  </Label>
                  <Textarea
                    id="posologia"
                    placeholder="Descreva a posologia"
                    value={posologia}
                    onChange={(e) => setPosologia(e.target.value)}
                    className="mt-1 min-h-[100px]"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tempo-uso" className="font-medium">
                      Tempo de Uso*
                    </Label>
                    <Input
                      id="tempo-uso"
                      type="number"
                      placeholder="Quantidade"
                      value={tempoUso}
                      onChange={(e) => setTempoUso(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="periodo" className="font-medium">
                      Período
                    </Label>
                    <Select value={periodo} onValueChange={setPeriodo}>
                      <SelectTrigger id="periodo" className="mt-1">
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dias">Dias</SelectItem>
                        <SelectItem value="semanas">Semanas</SelectItem>
                        <SelectItem value="meses">Meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium">
                    Permite Substituições?
                  </Label>
                  <RadioGroup
                    value={permiteSubstituicao}
                    onValueChange={setPermiteSubstituicao}
                    className="flex space-x-6 mt-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="sim" />
                      <Label htmlFor="sim">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="não" id="nao" />
                      <Label htmlFor="nao">Não</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label htmlFor="cid" className="font-medium">
                    CID (Opcional)
                  </Label>
                  <Input
                    id="cid"
                    placeholder="Digite o CID"
                    value={cid}
                    onChange={(e) => setCid(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tipo-receita" className="font-medium">
                    Tipo de Receita*
                  </Label>
                  <Select value={tipoReceita} onValueChange={setTipoReceita}>
                    <SelectTrigger id="tipo-receita" className="mt-1">
                      <SelectValue placeholder="Selecione o tipo de receita" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simples">Simples</SelectItem>
                      <SelectItem value="controlada">Controlada</SelectItem>
                      <SelectItem value="antimicrobiano">Antimicrobiano</SelectItem>
                      <SelectItem value="especial">Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="observacoes" className="font-medium">
                    Observações
                  </Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Observações adicionais"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="font-medium">
                    Assinatura Digital*
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
              <PdfUpload 
                onUploadComplete={handlePdfUploadComplete} 
                userId={medicoUserId} 
                pacienteId={pacienteId ? parseInt(pacienteId) : null}
                docType="receita"
              />
            )}
            
            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto" 
                disabled={(activeTab === 'formulario' && !assinado) || (activeTab === 'pdf' && !pdfFilePath)}
                onClick={(e) => {
                  e.preventDefault();
                  setShowPreview(true);
                }}
              >
                Visualizar Receita
              </Button>
              
              <Button type="button" variant="outline" className="w-full md:w-auto mt-2 md:mt-0">
                <Printer className="h-4 w-4 mr-2" /> Imprimir
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Modal de prévia da receita */}
      {showPreview && pacienteInfo && (
        <ReceitaPreview
          paciente={pacienteInfo}
          medico={medicoInfo}
          receita={{
            medicamento,
            posologia,
            tempoUso,
            periodo,
            permiteSubstituicao,
            cid,
            tipoReceita,
            observacoes,
            data_criacao: new Date(),
            data_validade: previewDataValidade || new Date(),
          }}
          onConfirm={async () => {
            // Calcular data de validade
            const dataValidade = new Date();
            const dias = parseInt(tempoUso);
            if (!isNaN(dias)) {
              if (periodo === 'dias') {
                dataValidade.setDate(dataValidade.getDate() + dias);
              } else if (periodo === 'semanas') {
                dataValidade.setDate(dataValidade.getDate() + dias * 7);
              } else if (periodo === 'meses') {
                dataValidade.setMonth(dataValidade.getMonth() + dias);
              }
            } else {
              dataValidade.setDate(dataValidade.getDate() + 30); // Padrão: 30 dias
            }
            
            // Criar objeto da receita para salvar
            const receitaData = {
              id_paciente: parseInt(pacienteId),
              medicamento,
              posologia,
              // Incluir informações adicionais nas observações
              observacoes: `${observacoes ? observacoes + '\n\n' : ''}Tempo de uso: ${tempoUso} ${periodo}. ${cid ? `CID: ${cid}.` : ''} ${permiteSubstituicao === 'sim' ? 'Permite substituição do medicamento.' : 'Não permite substituição do medicamento.'}`,
              tipo_receita: tipoReceita,
              data_validade: dataValidade,
            };
            
            try {
              await createReceita(receitaData);
              setSuccess(true);
              setShowPreview(false);
              resetForm();
              toast({
                title: "Receita criada com sucesso",
                description: "A receita foi gerada e salva com sucesso."
              });
            } catch (error) {
              console.error("Erro ao criar receita:", error);
              toast({
                variant: "destructive",
                title: "Erro",
                description: "Ocorreu um erro ao gerar a receita."
              });
            }
          }}
          onCancel={() => {
            setShowPreview(false);
          }}
          onPrint={() => {
            setIsGeneratingPDF(true);
            try {
              // Criar uma nova janela para impressão
              const printWindow = window.open('about:blank', '_blank');
              
              if (!printWindow) {
                toast({
                  variant: "destructive",
                  title: "Pop-up bloqueado",
                  description: "Seu navegador bloqueou a janela de impressão. Por favor, permita pop-ups para este site."
                });
                setIsGeneratingPDF(false);
                return;
              }
              
              // Criar data de validade
              const dataValidade = new Date();
              const dias = parseInt(tempoUso);
              if (!isNaN(dias)) {
                if (periodo === 'dias') {
                  dataValidade.setDate(dataValidade.getDate() + dias);
                } else if (periodo === 'semanas') {
                  dataValidade.setDate(dataValidade.getDate() + dias * 7);
                } else if (periodo === 'meses') {
                  dataValidade.setMonth(dataValidade.getMonth() + dias);
                }
              } else {
                dataValidade.setDate(dataValidade.getDate() + 30); // Padrão: 30 dias
              }
              
              // Criar o HTML para impressão
              const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <title>Receita Médica - ${pacienteInfo.nome}</title>
                  <style>
                    /* Reset e estilos base */
                    * {
                      box-sizing: border-box;
                      margin: 0;
                      padding: 0;
                    }
                    
                    html, body {
                      font-family: Arial, sans-serif;
                      font-size: 12pt;
                      line-height: 1.5;
                      color: #333;
                      background: white;
                    }
                    
                    /* Layout da página */
                    .page {
                      width: 210mm;
                      min-height: 297mm;
                      padding: 20mm;
                      margin: 0 auto;
                      background: white;
                    }
                    
                    /* Cabeçalho */
                    .header {
                      text-align: center;
                      margin-bottom: 15mm;
                    }
                    
                    .header h1 {
                      font-size: 20pt;
                      margin-bottom: 5mm;
                    }
                    
                    .header h2 {
                      font-size: 16pt;
                      margin-bottom: 3mm;
                    }
                    
                    /* Seções */
                    .section {
                      margin-bottom: 10mm;
                    }
                    
                    .section h3 {
                      font-size: 14pt;
                      margin-bottom: 3mm;
                      border-bottom: 1px solid #ccc;
                      padding-bottom: 2mm;
                    }
                    
                    .section p {
                      margin-bottom: 2mm;
                    }
                    
                    /* Área do medicamento */
                    .medication-box {
                      background-color: #f9f9f9;
                      border: 1px solid #ddd;
                      border-radius: 3mm;
                      padding: 5mm;
                      margin-bottom: 5mm;
                    }
                    
                    /* Assinatura */
                    .signature {
                      margin-top: 20mm;
                      text-align: center;
                    }
                    
                    .signature-line {
                      width: 70mm;
                      margin: 0 auto 3mm auto;
                      border-top: 1px solid #000;
                    }
                    
                    /* Rodapé */
                    .footer {
                      margin-top: 20mm;
                      text-align: center;
                      font-size: 8pt;
                      color: #666;
                    }
                    
                    /* Configurações específicas para impressão */
                    @media print {
                      @page {
                        size: A4;
                        margin: 0;
                      }
                      
                      html, body {
                        width: 210mm;
                        height: 297mm;
                      }
                      
                      .page {
                        margin: 0;
                        border: none;
                        box-shadow: none;
                      }
                      
                      .no-print {
                        display: none;
                      }
                    }
                  </style>
                </head>
                <body>
                  <div class="page">
                    <div class="header">
                      <h1>HOPE CANN CONNECT</h1>
                      <h2>PRESCRIÇÃO MÉDICA</h2>
                      <p><strong>Tipo:</strong> ${tipoReceita.toUpperCase()}</p>
                    </div>
                    
                    <div class="section">
                      <h3>Informações do Paciente</h3>
                      <p><strong>Nome:</strong> ${pacienteInfo.nome}</p>
                      ${pacienteInfo.cpf ? `<p><strong>CPF:</strong> ${pacienteInfo.cpf}</p>` : ''}
                      ${pacienteInfo.data_nascimento ? `<p><strong>Data de Nascimento:</strong> ${pacienteInfo.data_nascimento}</p>` : ''}
                    </div>
                    
                    <div class="section">
                      <h3>Prescrição</h3>
                      <div class="medication-box">
                        <p><strong>${medicamento}</strong></p>
                        <p><strong>Posologia:</strong> ${posologia}</p>
                        <p><strong>Tempo de Uso:</strong> ${tempoUso} ${periodo}</p>
                        <p><strong>Permite Substituição:</strong> ${permiteSubstituicao}</p>
                        ${cid ? `<p><strong>CID:</strong> ${cid}</p>` : ''}
                      </div>
                    </div>
                    
                    ${observacoes ? `
                    <div class="section">
                      <h3>Observações</h3>
                      <p>${observacoes}</p>
                    </div>` : ''}
                    
                    <div class="section">
                      <p><strong>Data de Emissão:</strong> ${format(new Date(), "dd/MM/yyyy")}</p>
                      <p><strong>Validade:</strong> ${format(dataValidade, "dd/MM/yyyy")}</p>
                    </div>
                    
                    <div class="signature">
                      <div class="signature-line"></div>
                      <p><strong>${medicoInfo.nome}</strong></p>
                      <p>CRM: ${medicoInfo.crm}</p>
                      <p>${medicoInfo.especialidade}</p>
                    </div>
                    
                    <div class="footer">
                      <p>Documento gerado digitalmente pelo sistema Hope Cann Connect</p>
                      <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
                    </div>
                  </div>
                  
                  <div class="no-print" style="text-align:center; margin:20px;">
                    <button onclick="window.print();" style="padding:10px 20px; font-size:16px; cursor:pointer;">
                      Imprimir Receita
                    </button>
                  </div>
                  
                  <script>
                    // Automaticamente imprimir após um curto intervalo
                    window.onload = function() {
                      setTimeout(function() {
                        window.print();
                      }, 500);
                    };
                  </script>
                </body>
                </html>
              `;
              
              // Escrever o conteúdo HTML na nova janela
              printWindow.document.open();
              printWindow.document.write(htmlContent);
              printWindow.document.close();
              
              // Foco na nova janela
              printWindow.focus();
              
              setIsGeneratingPDF(false);
            } catch (error) {
              console.error('Erro ao preparar documento para impressão:', error);
              toast({
                variant: "destructive",
                title: "Erro na impressão",
                description: "Ocorreu um erro ao preparar o documento para impressão."
              });
              setIsGeneratingPDF(false);
            }
          }}
          onDownload={async () => {
            setIsGeneratingPDF(true);
            try {
              // Criar a data de validade
              const dataValidade = new Date();
              const dias = parseInt(tempoUso);
              if (!isNaN(dias)) {
                if (periodo === 'dias') {
                  dataValidade.setDate(dataValidade.getDate() + dias);
                } else if (periodo === 'semanas') {
                  dataValidade.setDate(dataValidade.getDate() + dias * 7);
                } else if (periodo === 'meses') {
                  dataValidade.setMonth(dataValidade.getMonth() + dias);
                }
              } else {
                dataValidade.setDate(dataValidade.getDate() + 30); // Padrão: 30 dias
              }
              
              // Preparar dados para o PDF
              const prescricaoData = {
                paciente: pacienteInfo,
                medico: medicoInfo,
                receita: {
                  medicamento,
                  posologia,
                  tempoUso,
                  periodo,
                  permiteSubstituicao,
                  cid,
                  tipoReceita,
                  observacoes,
                  data_criacao: new Date(),
                  data_validade: dataValidade,
                },
              };
              
              // Gerar e baixar o PDF
              const blob = await generatePrescricaoPDF(prescricaoData);
              downloadPDF(blob, `receita_${pacienteInfo.nome.replace(/\s+/g, '_')}_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
              
              setIsGeneratingPDF(false);
            } catch (error) {
              console.error('Erro ao gerar PDF:', error);
              toast({
                variant: "destructive",
                title: "Erro ao gerar PDF",
                description: "Ocorreu um erro ao gerar o arquivo PDF."
              });
              setIsGeneratingPDF(false);
            }
          }}
        />
      )}

      {/* Área de exibição e download do PDF após o sucesso */}
      {success && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Prescrição Gerada com Sucesso</h3>
            
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  // Reiniciar o formulário para uma nova prescrição
                  resetForm();
                  setSuccess(false);
                }}
              >
                Nova Prescrição
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Não precisamos mais do template visual para PDF, pois estamos gerando o PDF diretamente */}
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Este sistema está em conformidade com as regulamentações da ANVISA</p>
        <p>© 2025 Sistema de Prescrição Digital. Todos os direitos reservados.</p>
      </div>
    </div>
  );
};

export default Prescricoes;
