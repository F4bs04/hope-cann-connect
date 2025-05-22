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
import PrescriptionPrintTemplate from './PrescriptionPrintTemplate';

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
  const printTemplateRef = useRef<HTMLDivElement>(null);

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
    if (activeTab === 'pdf' && pdfFilePath && mainActiveTab === 'simples') {
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
        medicamento: "Receita via PDF anexado (Simples)",
        posologia: "Ver documento anexo",
        observacoes: "Documento PDF anexado pelo médico",
        data_validade: dataValidade.toISOString(),
        status: 'ativa',
        arquivo_pdf: pdfFilePath,
        tipo_receita: 'simples_pdf', // Adicionando um tipo para PDFs simples
      };
      
      const newReceita = await createReceita(receitaData);
      
      if (newReceita) {
        setSuccess(true);
        resetSimpleForm();
        return;
      }
    } else if (mainActiveTab === 'pdf' && pdfFilePath) {
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
        medicamento: "Receita via PDF Externo",
        posologia: "Ver documento anexo",
        observacoes: "Documento PDF externo anexado pelo médico",
        data_validade: dataValidade.toISOString(),
        status: 'ativa',
        arquivo_pdf: pdfFilePath,
        tipo_receita: 'externo_pdf', // Adicionando um tipo para PDFs externos
      };
      const newReceita = await createReceita(receitaData);
      if (newReceita) {
        setSuccess(true);
        resetSimpleForm();
        return;
      }
    }
    
    if (mainActiveTab === 'simples' && activeTab === 'formulario') {
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
      
      const dataValidade = new Date();
      dataValidade.setDate(dataValidade.getDate() + 30);
      
      const receitaData = {
        id_paciente: parseInt(pacienteId),
        medicamento,
        posologia,
        observacoes: `Tempo de uso: ${tempoUso} ${periodo}. ${permiteSubstituicao === 'sim' ? 'Permite substituição. ' : 'Não permite substituição. '}${cid ? `CID: ${cid}. ` : ''}${observacoes ? observacoes : ''}`,
        data_validade: dataValidade.toISOString(),
        status: 'ativa',
        tipo_receita: tipoReceita,
      };
      
      const newReceita = await createReceita(receitaData);
      
      if (newReceita) {
        setSuccess(true);
        resetSimpleForm();
      }
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
  };
  
  const handlePdfUploadComplete = (filePath: string) => {
    setPdfFilePath(filePath);
  };

  const handleDetailedPrescriptionSubmit = (data: PrescriptionData) => {
    setDetailedPrescriptionData(data);
    // Simulate saving to database and getting a prescription number
    const simulatedPrescriptionNumber = `HC-${Date.now().toString().slice(-6)}`;
    const dataToSave : PrescriptionData = {
      ...data,
      prescriptionNumber: data.prescriptionNumber || simulatedPrescriptionNumber,
    };
    setDetailedPrescriptionData(dataToSave);

    toast({
      title: "Preview Gerado",
      description: "O preview da receita detalhada está pronto. Verifique abaixo e gere o PDF ou imprima.",
    });
  };

  const generatePdfFromDetailed = async () => {
    const printNode = printTemplateRef.current;
    if (!printNode || !detailedPrescriptionData) {
      toast({ variant: "destructive", title: "Erro", description: "Template de impressão não disponível para gerar PDF." });
      return;
    }

    // Salvar estilos originais do container printNode (o que fica off-screen)
    const originalPrintNodeStyles = {
      display: printNode.style.display,
      position: printNode.style.position,
      left: printNode.style.left,
      top: printNode.style.top,
      width: printNode.style.width,
      height: printNode.style.height,
      minHeight: printNode.style.minHeight,
      backgroundColor: printNode.style.backgroundColor,
      padding: printNode.style.padding,
      margin: printNode.style.margin,
      zIndex: printNode.style.zIndex,
      overflow: printNode.style.overflow,
    };

    // Aplicar estilos ao container para torná-lo visível e dimensionado para captura
    printNode.style.display = 'block';
    printNode.style.position = 'fixed'; // Usar fixed para garantir que está no viewport e não é afetado por scroll
    printNode.style.left = '0px'; // Temporariamente no canto da tela
    printNode.style.top = '0px';
    printNode.style.zIndex = '10000'; // Alto z-index para sobrepor
    printNode.style.width = '210mm'; // A4 width
    printNode.style.height = 'auto'; // Altura baseada no conteúdo
    printNode.style.minHeight = '297mm'; // A4 min height para garantir espaço
    printNode.style.backgroundColor = 'white';
    printNode.style.overflow = 'visible'; // Garante que nada seja cortado do container
    printNode.style.padding = '0'; // Sem padding no container em si
    printNode.style.margin = '0';  // Sem margin no container em si


    const prescriptionElement = printNode.querySelector('.printable-prescription') as HTMLElement;
    if (!prescriptionElement) {
        toast({ variant: "destructive", title: "Erro", description: "Elemento interno da prescrição não encontrado." });
        Object.assign(printNode.style, originalPrintNodeStyles); // Restaurar estilos
        return;
    }
    
    // Forçar reflow para garantir que os estilos foram aplicados ao printNode e prescriptionElement
    prescriptionElement.offsetHeight; 

    // Pequeno delay para renderização completa, especialmente de imagens/fontes
    await new Promise(resolve => setTimeout(resolve, 500)); 
    console.log("Prescricoes.tsx: Preparado para html2canvas.");

    try {
      console.log("Prescricoes.tsx: Chamando html2canvas em prescriptionElement.");
      const canvas = await html2canvas(prescriptionElement, { // Alvo é o .printable-prescription
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff', // Fundo branco para o canvas
        scrollX: 0, // Como o elemento está 'fixed' e posicionado, scroll da página principal não deve afetar
        scrollY: 0,
        windowWidth: prescriptionElement.scrollWidth, // Usar as dimensões do próprio elemento
        windowHeight: prescriptionElement.scrollHeight,
        onclone: (documentClone) => {
            console.log("Prescricoes.tsx: html2canvas onclone. O 'documentClone.documentElement' é o '.printable-prescription' clonado.");
            const clonedElementRoot = documentClone.documentElement; // Ou documentClone.body
            Object.assign((clonedElementRoot as HTMLElement).style, {
                display: 'block',
                visibility: 'visible',
                position: 'relative', // Importante para o layout interno
                width: '210mm',       // Largura A4
                minHeight: '297mm',   // Altura mínima A4
                height: 'auto',       // Altura baseada no conteúdo
                margin: '0',          // Sem margens externas no elemento raiz da captura
                padding: '15mm',      // Margens internas para o conteúdo da receita
                boxSizing: 'border-box',
                backgroundColor: 'white',
                color: 'black',
                fontFamily: "'Times New Roman', Times, serif", // Garante a fonte correta
                fontSize: '12pt',      // Garante o tamanho da fonte
                border: 'none',
                boxShadow: 'none',
            });
          }
      });
      
      console.log(`Prescricoes.tsx: html2canvas concluído. Dimensões do Canvas: ${canvas.width}x${canvas.height}`);
      if (canvas.width === 0 || canvas.height === 0) {
          console.error("Prescricoes.tsx: Canvas gerado com dimensões zero.");
          toast({ variant: "destructive", title: "Erro ao Gerar PDF", description: "Falha ao renderizar o conteúdo da receita (canvas vazio)." });
          Object.assign(printNode.style, originalPrintNodeStyles); // Restaurar estilos
          return;
      }

      const imgData = canvas.toDataURL('image/png');
      console.log("Prescricoes.tsx: imgData gerado (primeiros 100 chars):", imgData.substring(0,100));
      
      if (!imgData || !imgData.startsWith('data:image/png;base64,')) {
        console.error("Prescricoes.tsx: Formato de imgData inválido a partir do canvas.toDataURL.");
        toast({ variant: "destructive", title: "Erro ao Gerar PDF", description: "Falha ao converter o conteúdo da receita para imagem." });
        Object.assign(printNode.style, originalPrintNodeStyles); // Restaurar estilos
        return;
      }
      
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Tenta obter as propriedades da imagem. Se imgData for inválido, isso pode falhar.
      let imgProps;
      try {
        imgProps = pdf.getImageProperties(imgData);
        console.log("Prescricoes.tsx: Propriedades da imagem:", imgProps);
      } catch (e) {
        console.error("Prescricoes.tsx: Erro ao chamar pdf.getImageProperties(imgData):", e);
        console.error("Prescricoes.tsx: imgData problemático (primeiros 100 chars):", imgData.substring(0,100));
        toast({ variant: "destructive", title: "Erro ao Processar Imagem", description: "Não foi possível ler as propriedades da imagem gerada." });
        Object.assign(printNode.style, originalPrintNodeStyles); // Restaurar estilos
        return;
      }
      
      const aspectRatio = imgProps.width / imgProps.height;
      let imgRenderWidth = pdfWidth; 
      let imgRenderHeight = imgRenderWidth / aspectRatio;

      // Ajusta a altura se exceder a capacidade de uma página, mas mantendo a largura total
      // jsPDF lida com múltiplas páginas se a altura da imagem for maior que pdfHeight
      if (imgRenderHeight > pdfHeight && imgRenderWidth === pdfWidth) {
        // Deixa o jsPDF criar múltiplas páginas se necessário
        console.log("Prescricoes.tsx: Imagem potencialmente multi-página. Altura renderizada: ", imgRenderHeight);
      } else if (imgRenderHeight < pdfHeight && imgRenderWidth === pdfWidth) {
        // Imagem cabe em uma página, renderiza com altura calculada
      } else { // Caso de proporções muito largas, recalcula baseado na altura (improvável para A4)
          imgRenderHeight = pdfHeight;
          imgRenderWidth = imgRenderHeight * aspectRatio;
      }


      console.log(`Prescricoes.tsx: Dimensões para PDF: largura ${imgRenderWidth}, altura ${imgRenderHeight}`);
      pdf.addImage(imgData, 'PNG', 0, 0, imgRenderWidth, imgRenderHeight);
      
      const fileName = `receita-${detailedPrescriptionData.prescriptionNumber || detailedPrescriptionData.patient.name.replace(/\s/g, '_')}-${Date.now()}.pdf`;
      pdf.save(fileName);
      console.log(`Prescricoes.tsx: PDF salvo como: ${fileName}`);
      toast({ title: "PDF Gerado", description: "O PDF da receita foi baixado." });

    } catch (error) {
      console.error("Prescricoes.tsx: Erro ao gerar PDF com html2canvas/jsPDF:", error);
      toast({ variant: "destructive", title: "Erro ao Gerar PDF", description: `Ocorreu um problema: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      console.log("Prescricoes.tsx: Bloco finally: restaurando estilos e limpando.");
      // Restaurar estilos originais do container printNode
      Object.assign(printNode.style, originalPrintNodeStyles);
      
      // Garante que o elemento volte para fora da tela após a captura
      printNode.style.left = '-9999px'; 
      printNode.style.top = '-9999px';
      printNode.style.zIndex = '-1'; // E fique por baixo de tudo
      console.log("Prescricoes.tsx: Geração de PDF (detailed) finalizada.");
    }
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
            onClick={() => {
              window.print(); 
            }}
          >
            <Printer className="mr-2 h-5 w-5" />
            Imprimir Receita
          </Button>
          <Button 
            size="lg"
            onClick={() => { setSuccess(false); resetSimpleForm(); setDetailedPrescriptionData(null); }}
          >
            Criar Nova Receita
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="no-print">
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
                docType="receita"
              />
              <Button 
                type="button" 
                onClick={handleSimpleSubmit} 
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
            <CardHeader className="no-print"><CardTitle>Gerar Receita Médica Detalhada</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="no-print">
                  <h3 className="text-xl font-semibold mb-4">Formulário da Receita</h3>
                  <PrescriptionForm onSubmit={handleDetailedPrescriptionSubmit} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 no-print">Preview da Receita (Tela)</h3>
                  <div ref={previewRef} className="no-print">
                    <PrescriptionPreview data={detailedPrescriptionData} />
                  </div>
                  {/* This container is specifically for printing/PDF generation */}
                  <div ref={printTemplateRef} className="print-only-container">
                    {detailedPrescriptionData && <PrescriptionPrintTemplate data={detailedPrescriptionData} />}
                  </div>
                  {detailedPrescriptionData && (
                    <div className="mt-6 flex gap-4 justify-end no-print">
                      <Button onClick={generatePdfFromDetailed} variant="default" size="lg">
                        <Download className="mr-2 h-4 w-4" /> Baixar PDF
                      </Button>
                      <Button onClick={() => window.print()} variant="outline" size="lg">
                        <Printer className="mr-2 h-4 w-4" /> Imprimir Receita
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 text-center text-sm text-gray-500 no-print">
        <p>Este sistema está em conformidade com as regulamentações da ANVISA</p>
        <p>© 2025 Sistema de Prescrição Digital. Todos os direitos reservados.</p>
      </div>
    </div>
  );
};

export default Prescricoes;
