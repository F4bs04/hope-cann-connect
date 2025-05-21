import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Check, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPacientes, createReceita } from '@/services/supabaseService';
import PdfUpload from '@/components/ui/pdf-upload';
import PrescriptionForm from './PrescriptionForm';
import PrescriptionPreview from './PrescriptionPreview';
import { PrescriptionData } from '@/types/prescription';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Prescricoes: React.FC = () => {
  const { toast } = useToast();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('formulario');
  const [mainActiveTab, setMainActiveTab] = useState('simples');
  const [medicoUserId, setMedicoUserId] = useState<number | null>(null);
  const [pdfFilePath, setPdfFilePath] = useState<string | null>(null);

  // Form state for simple prescription
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

  // State for detailed prescription
  const [detailedPrescriptionData, setDetailedPrescriptionData] = useState<PrescriptionData | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPacientes = async () => {
      setLoading(true);
      const data = await getPacientes();
      setPacientes(data);
      setLoading(false);
    };
    
    loadPacientes();
    
    const userId = localStorage.getItem("userId");
    if (userId) {
      setMedicoUserId(parseInt(userId));
    }
  }, []);
  
  const handleSimpleSubmit = async (e: React.FormEvent) => {
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
      
      const dataValidade = new Date();
      dataValidade.setDate(dataValidade.getDate() + 30);
      
      const receitaData = {
        id_paciente: parseInt(pacienteId),
        medicamento: "Receita via PDF anexado",
        posologia: "Ver documento anexo",
        observacoes: "Documento PDF anexado pelo médico",
        data_validade: dataValidade.toISOString(),
        status: 'ativa',
        arquivo_pdf: pdfFilePath
      };
      
      const newReceita = await createReceita(receitaData);
      
      if (newReceita) {
        setSuccess(true);
        return;
      }
    }
    
    // Validações para o formulário normal
    if (!pacienteId) {
      toast({
        variant: "destructive",
        title: "Paciente obrigatório",
        description: "Por favor, selecione um paciente",
      });
      return;
    }
    
    if (!medicamento) {
      toast({
        variant: "destructive",
        title: "Medicamento obrigatório",
        description: "Por favor, insira um medicamento",
      });
      return;
    }
    
    if (!posologia) {
      toast({
        variant: "destructive",
        title: "Posologia obrigatória",
        description: "Por favor, insira a posologia",
      });
      return;
    }
    
    if (!assinado) {
      toast({
        variant: "destructive",
        title: "Assinatura obrigatória",
        description: "Por favor, assine digitalmente a prescrição",
      });
      return;
    }
    
    // Calculate validity date (30 days)
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + 30);
    
    const receitaData = {
      id_paciente: parseInt(pacienteId),
      medicamento,
      posologia,
      observacoes: `Tempo de uso: ${tempoUso} ${periodo}. ${permiteSubstituicao === 'sim' ? 'Permite substituição. ' : 'Não permite substituição. '}${observacoes ? observacoes : ''}`,
      data_validade: dataValidade.toISOString(),
      status: 'ativa'
    };
    
    const newReceita = await createReceita(receitaData);
    
    if (newReceita) {
      setSuccess(true);
      resetSimpleForm();
    }
  };
  
  const resetSimpleForm = () => {
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

  const handleDetailedPrescriptionSubmit = (data: PrescriptionData) => {
    setDetailedPrescriptionData(data);
    toast({
      title: "Preview Gerado",
      description: "O preview da receita detalhada está pronto. Verifique abaixo e gere o PDF.",
    });
  };

  const generatePdfFromPreview = async () => {
    if (!previewRef.current || !detailedPrescriptionData) {
      toast({ variant: "destructive", title: "Erro", description: "Preview não disponível para gerar PDF." });
      return;
    }

    const canvas = await html2canvas(previewRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'p', // portrait
      unit: 'mm', // millimeters
      format: 'a4', // A4 size
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth - 20; // Margin of 10mm on each side
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
    let position = 10; // Top margin
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    
    // Handle content that might overflow one page (basic example, needs refinement for complex cases)
    if (imgHeight > pdfHeight - 20) { // Check if image height exceeds page height with margins
      // This is a simplified handling. For true multi-page, you'd need to split the canvas or content.
      console.warn("Conteúdo da prescrição pode exceder uma página. Funcionalidade de múltiplas páginas não totalmente implementada.");
    }

    pdf.save(`receita-${detailedPrescriptionData.prescriptionNumber}-${Date.now()}.pdf`);
    toast({ title: "PDF Gerado", description: "O PDF da receita foi baixado." });
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
            onClick={() => { setSuccess(false); resetSimpleForm(); }}
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
          Gere receitas simples, anexe PDFs ou crie receitas detalhadas.
        </p>
      </div>
      
      <Tabs value={mainActiveTab} onValueChange={setMainActiveTab} className="w-full mb-6">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="simples">Receita Simples</TabsTrigger>
          <TabsTrigger value="pdf">Anexar PDF de Receita</TabsTrigger>
          <TabsTrigger value="detalhada">Gerar Receita Detalhada</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simples">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="formulario">Preencher Formulário</TabsTrigger>
                  <TabsTrigger value="pdf">Anexar PDF (Simples)</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSimpleSubmit} className="space-y-6">
                {/* Paciente Select for simple/pdf forms */}
                <div>
                  <Label htmlFor="pacienteSimple" className="font-medium">
                    Paciente*
                  </Label>
                  <Select value={pacienteId} onValueChange={setPacienteId} required>
                    <SelectTrigger id="pacienteSimple" className="mt-1">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {pacientes.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nome} ({p.idade} anos)
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
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto" 
                    disabled={(activeTab === 'formulario' && !assinado) || (activeTab === 'pdf' && !pdfFilePath && mainActiveTab === 'simples')}
                  >
                    {activeTab === 'pdf' ? 'Anexar PDF da Receita' : 'Gerar Receita Simples'}
                  </Button>
                  
                  <Button type="button" variant="outline" className="w-full md:w-auto mt-2 md:mt-0" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" /> Imprimir
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pdf">
          <Card className="max-w-2xl mx-auto">
            <CardHeader><CardTitle>Anexar PDF de Receita Externa</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                  <Label htmlFor="pacientePdf" className="font-medium">
                    Paciente* (para associar ao PDF)
                  </Label>
                  <Select value={pacienteId} onValueChange={setPacienteId} required>
                    <SelectTrigger id="pacientePdf" className="mt-1">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {pacientes.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nome} ({p.idade} anos)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              <PdfUpload 
                onUploadComplete={handlePdfUploadComplete} 
                userId={medicoUserId} 
                pacienteId={pacienteId ? parseInt(pacienteId) : null}
                docType="receita_externa" // Differentiate docType if needed
              />
              <Button 
                type="button" 
                onClick={handleSimpleSubmit} // Reuse submit logic, ensure activeTab is set correctly or make a new handler
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!pdfFilePath || !pacienteId}
              >
                Salvar PDF Anexado
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detalhada">
          <Card className="w-full">
            <CardHeader><CardTitle>Gerar Receita Médica Detalhada</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Formulário da Receita</h3>
                  <PrescriptionForm onSubmit={handleDetailedPrescriptionSubmit} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Preview da Receita</h3>
                  <div ref={previewRef}>
                    <PrescriptionPreview data={detailedPrescriptionData} />
                  </div>
                  {detailedPrescriptionData && (
                    <div className="mt-6 flex gap-4 justify-end">
                       <Button onClick={generatePdfFromPreview} variant="default" size="lg">
                        <Download className="mr-2 h-4 w-4" /> Baixar PDF
                      </Button>
                      <Button onClick={() => window.print()} variant="outline" size="lg">
                        <Printer className="mr-2 h-4 w-4" /> Imprimir Preview
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Este sistema está em conformidade com as regulamentações da ANVISA</p>
        <p>© 2025 Sistema de Prescrição Digital. Todos os direitos reservados.</p>
      </div>
    </div>
  );
};

export default Prescricoes;
