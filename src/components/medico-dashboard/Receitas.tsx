import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// Label não é usado, removido
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FilePlus, FileText, Calendar, Download, Eye, FileUp, Loader2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns'; // Adicionado isValid
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { getReceitas, downloadDocument } from '@/services/supabaseService';
import { getMedicoDetailsById } from '@/services/medicos/medicosService';
import { PrescriptionData, DoctorInfo, PatientInfo, MedicationItem } from '@/types/prescription';
import PrescriptionPrintTemplate from './PrescriptionPrintTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Receitas: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('ativa'); // Default para 'ativa'
  const [receitas, setReceitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [printingData, setPrintingData] = useState<PrescriptionData | null>(null);
  const printTemplateRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      console.log("Carregando dados iniciais...");
      try {
        const medicoIdStr = localStorage.getItem("userId");
        let drInfo: DoctorInfo | null = null;

        if (medicoIdStr) {
          const medicoId = parseInt(medicoIdStr, 10);
          if (!isNaN(medicoId)) {
            console.log(`Buscando detalhes do médico ID: ${medicoId}`);
            drInfo = await getMedicoDetailsById(medicoId);
            setDoctorInfo(drInfo);
            console.log("Detalhes do médico carregados:", drInfo);
          } else {
            console.warn("UserID do localStorage não é um número válido:", medicoIdStr);
          }
        } else {
          console.warn("UserID não encontrado no localStorage.");
        }
        
        console.log("Buscando receitas...");
        const receitasData = await getReceitas();
        setReceitas(receitasData);
        console.log("Receitas carregadas:", receitasData.length);

      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações. Tente novamente.",
        });
      } finally {
        setLoading(false);
        console.log("Carregamento inicial finalizado.");
      }
    };
    
    loadInitialData();
  }, [toast]);

  useEffect(() => {
    if (printingData && printTemplateRef.current && doctorInfo) {
      console.log("printingData, printTemplateRef e doctorInfo prontos. Chamando generateAndDownloadPdf.");
      generateAndDownloadPdf();
    } else {
      if (!printingData) console.log("useEffect generatePdf: printingData é null");
      if (!printTemplateRef.current) console.log("useEffect generatePdf: printTemplateRef.current é null");
      if (!doctorInfo) console.log("useEffect generatePdf: doctorInfo é null");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printingData]); // Removida dependência do doctorInfo daqui, pois ele já é verificado no if

  const filteredReceitas = receitas.filter(receita => 
    (receita.pacientes_app?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    receita.medicamento?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedTab === 'todas' || receita.status === selectedTab)
  );

  const formatDateForPrescription = (dateString: string | Date | null): string => {
    if (!dateString) return 'N/A';
    try {
      const dateObj = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      if (isValid(dateObj)) { // Checa se a data é válida
        return format(dateObj, 'dd/MM/yyyy');
      }
      return dateString.toString(); // Retorna como string se inválida
    } catch (e) {
      console.error("Erro ao formatar data para prescrição:", e, "Valor original:", dateString);
      return dateString.toString(); // Retorna como string em caso de erro
    }
  };

  const generateAndDownloadPdf = async () => {
    console.log("Iniciando generateAndDownloadPdf...");
    if (!printingData || !printTemplateRef.current || !doctorInfo) {
      toast({ variant: "destructive", title: "Erro", description: "Dados insuficientes para gerar PDF. Verifique console." });
      console.error("generateAndDownloadPdf: Dados insuficientes.", { printingData, doctorInfo, printTemplateRefCurrent: !!printTemplateRef.current });
      setPrintingData(null);
      setIsGeneratingPdf(false);
      return;
    }
    
    setIsGeneratingPdf(true);
    toast({ title: "Gerando PDF...", description: "Aguarde um momento." });
    console.log("PDF sendo gerado para:", printingData.prescriptionNumber);

    const printNodeContainer = printTemplateRef.current; // Este é o div 'print-only-container'
    const printableElement = printNodeContainer.querySelector('.printable-prescription') as HTMLElement;

    if (!printableElement) {
        console.error("Elemento .printable-prescription não encontrado dentro do printNodeContainer.");
        toast({ variant: "destructive", title: "Erro Interno", description: "Não foi possível encontrar o template da receita para gerar o PDF." });
        setIsGeneratingPdf(false);
        setPrintingData(null);
        return;
    }
    
    // Salvar estilos originais do container
    const originalContainerStyles = {
      display: printNodeContainer.style.display,
      position: printNodeContainer.style.position,
      left: printNodeContainer.style.left,
      top: printNodeContainer.style.top,
      zIndex: printNodeContainer.style.zIndex,
      width: printNodeContainer.style.width,
      height: printNodeContainer.style.height,
      backgroundColor: printNodeContainer.style.backgroundColor,
    };

    // Aplicar estilos ao container para torná-lo visível e dimensionado para captura
    printNodeContainer.style.display = 'block';
    printNodeContainer.style.position = 'fixed'; // Usar fixed para garantir que está no viewport
    printNodeContainer.style.left = '0px';
    printNodeContainer.style.top = '0px';
    printNodeContainer.style.zIndex = '10000'; // Alto z-index
    printNodeContainer.style.width = '210mm'; // A4 width
    printNodeContainer.style.height = 'auto'; 
    printNodeContainer.style.backgroundColor = 'white';
    printNodeContainer.style.overflow = 'visible'; // Garante que nada seja cortado

    // Forçar reflow para garantir que os estilos foram aplicados
    printableElement.offsetHeight; 

    console.log("Estilos aplicados ao printNodeContainer. Pronto para html2canvas.");

    await new Promise(resolve => setTimeout(resolve, 300)); // Pequeno delay para renderização

    try {
      console.log("Chamando html2canvas...");
      const canvas = await html2canvas(printableElement, { // Alvo é o .printable-prescription
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff', // Fundo branco para o canvas
        scrollX: 0, // Evitar problemas de scroll
        scrollY: -window.scrollY, // Tentar compensar o scroll da página
        windowWidth: printableElement.scrollWidth,
        windowHeight: printableElement.scrollHeight,
         onclone: (documentClone) => {
            console.log("html2canvas onclone: clonando documento.");
            // No documento clonado, o elemento alvo (printableElement) já é o root.
            // Aplicamos estilos diretamente a ele ou a seus filhos, se necessário.
            const clonedPrintableElement = documentClone.querySelector('.printable-prescription');
            if (clonedPrintableElement) {
                console.log("Estilizando .printable-prescription no clone.");
                Object.assign((clonedPrintableElement as HTMLElement).style, {
                    display: 'block',
                    visibility: 'visible',
                    position: 'relative',
                    width: '210mm',
                    minHeight: '297mm', // Para garantir pelo menos uma página A4
                    height: 'auto',
                    margin: '0', // Sem margens externas no elemento principal
                    padding: '15mm', // Margens internas do conteúdo
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                    color: 'black',
                    fontFamily: "'Times New Roman', Times, serif",
                    fontSize: '12pt',
                    border: 'none',
                    boxShadow: 'none',
                });
            } else {
              console.error("onclone: .printable-prescription não encontrado no clone.");
            }
          }
      });
      
      console.log("html2canvas concluído. Canvas obtido:", canvas);
      const imgData = canvas.toDataURL('image/png');
      console.log("imgData gerado (primeiros 100 chars):", imgData.substring(0,100));
      
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      console.log("Propriedades da imagem:", imgProps);

      const aspectRatio = imgProps.width / imgProps.height;
      let imgRenderWidth = pdfWidth; // Renderiza a imagem na largura total do PDF
      let imgRenderHeight = imgRenderWidth / aspectRatio;

      // Se a altura calculada exceder a altura da página, jsPDF vai criar múltiplas páginas
      // No entanto, para garantir que não haja distorção se a imagem for menor que a página
      if (imgRenderHeight > pdfHeight && aspectRatio < (pdfWidth / pdfHeight)) { // Imagem mais "alta"
          // Não precisa ajustar, jsPDF vai lidar com múltiplas páginas
      } else if (imgRenderWidth > pdfWidth) { // Imagem mais "larga" (não deve acontecer se imgRenderWidth = pdfWidth)
          imgRenderHeight = pdfHeight;
          imgRenderWidth = imgRenderHeight * aspectRatio;
      }

      console.log(`Dimensões para PDF: largura ${imgRenderWidth}, altura ${imgRenderHeight}`);
      pdf.addImage(imgData, 'PNG', 0, 0, imgRenderWidth, imgRenderHeight);
      
      const fileName = `receita-${printingData.prescriptionNumber || printingData.patient.name.replace(/\s/g, '_')}-${Date.now()}.pdf`;
      pdf.save(fileName);
      console.log(`PDF salvo como: ${fileName}`);
      toast({ title: "PDF Gerado", description: "O PDF da receita foi baixado." });

    } catch (error) {
      console.error("Erro ao gerar PDF com html2canvas:", error);
      toast({ variant: "destructive", title: "Erro ao Gerar PDF", description: `Ocorreu um problema: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      console.log("Bloco finally: restaurando estilos e limpando.");
      // Restaurar estilos originais do container
      Object.assign(printNodeContainer.style, originalContainerStyles);
      
      // Certifique-se que o elemento volte para fora da tela
      printNodeContainer.style.left = '-9999px'; 
      printNodeContainer.style.top = '-9999px';
      printNodeContainer.style.zIndex = '-1';

      setPrintingData(null);
      setIsGeneratingPdf(false);
      console.log("Geração de PDF finalizada.");
    }
  };

  const handleDownload = async (receita: any) => {
    console.log("handleDownload chamado para receita:", receita.id);
    if (isGeneratingPdf) {
      toast({ title: "Aguarde", description: "Outro PDF está sendo gerado." });
      console.log("Download bloqueado: isGeneratingPdf é true.");
      return;
    }

    if (receita.arquivo_pdf) {
      console.log("Receita possui arquivo_pdf, baixando existente:", receita.arquivo_pdf);
      toast({ title: "Download iniciado", description: "O arquivo PDF existente está sendo baixado." });
      try {
        const fileName = receita.arquivo_pdf.split('/').pop() || `receita-${receita.id}.pdf`;
        const success = await downloadDocument(receita.arquivo_pdf, fileName);
        if (success) {
          toast({ title: "Download concluído", description: "O PDF foi baixado com sucesso." });
        } else {
          // downloadDocument já lida com toast de erro internamente
          console.warn("Falha ao baixar documento existente.");
        }
      } catch (error) {
        console.error("Erro ao baixar PDF existente:", error);
        toast({ variant: "destructive", title: "Erro no download", description: "Não foi possível baixar o PDF." });
      }
    } else {
      console.log("Receita não possui arquivo_pdf, gerando dinamicamente.");
      if (!doctorInfo) {
        toast({ variant: "destructive", title: "Erro", description: "Informações do médico não carregadas. Tente recarregar a página." });
        console.error("handleDownload: doctorInfo é null.");
        // Tentar recarregar informações do médico se estiverem faltando
        const medicoIdStr = localStorage.getItem("userId");
        if (medicoIdStr) {
            const medicoId = parseInt(medicoIdStr, 10);
            if (!isNaN(medicoId)) {
                const drInfo = await getMedicoDetailsById(medicoId);
                setDoctorInfo(drInfo);
                 if(drInfo) {
                    toast({ title: "Info do Médico Recarregada", description: "Tente baixar novamente." });
                 }
            }
        }
        return;
      }
      if (!receita.pacientes_app) {
        toast({ variant: "destructive", title: "Erro", description: "Informações do paciente não encontradas na receita." });
        console.error("handleDownload: receita.pacientes_app é null.");
        return;
      }

      const paciente = receita.pacientes_app;
      const patientData: PatientInfo = {
        name: paciente.nome || 'Paciente Desconhecido',
        cpf: paciente.cpf || 'N/A',
        birthDate: formatDateForPrescription(paciente.data_nascimento),
        address: paciente.endereco || '',
        phone: paciente.telefone || '',
      };
      console.log("Dados do paciente para o PDF:", patientData);

      // Split medicamento e posologia se estiverem combinados ou usar valores diretos
      // A estrutura MedicationItem espera 'name', 'dosage', 'quantity', 'instructions'
      // No seu modelo de 'receitas_app', você tem 'medicamento' e 'posologia'
      // Vamos adaptar:
      const medicationData: MedicationItem[] = [{
        id: receita.id.toString(),
        name: receita.medicamento || "Medicamento não especificado",
        dosage: "", // Se 'medicamento' incluir dosagem, precisaria parsear. Ex: "Dipirona 500mg" -> name: Dipirona, dosage: 500mg
        quantity: "", // Pode vir da posologia ou ser um campo separado. Ex: "1 caixa com 20 comprimidos"
        instructions: receita.posologia || "Seguir orientação médica.",
      }];
      console.log("Dados do medicamento para o PDF:", medicationData);
      
      const fullPrescriptionData: PrescriptionData = {
        doctor: doctorInfo, // Já deve estar carregado no useEffect inicial
        patient: patientData,
        prescriptionDate: formatDateForPrescription(receita.data),
        medications: medicationData,
        generalInstructions: receita.observacoes || "",
        prescriptionNumber: `REC-${receita.id}`,
      };
      console.log("Dados completos da prescrição para PDF:", fullPrescriptionData);
      
      setPrintingData(fullPrescriptionData); // Isso vai disparar o useEffect que chama generateAndDownloadPdf
      console.log("printingData definido, useEffect deve ser acionado.");
    }
  };

  const handleViewPrescription = (id: number) => {
    // Navigation or modal to view prescription details
    toast({
      title: "Visualizando receita",
      description: "Detalhes da receita #" + id,
    });
    // Implementar navegação para /area-medico/prescricoes/:id ou modal
  };

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
        
        <Button 
          className="bg-[#00B3B0] hover:bg-[#009E9B]"
          onClick={() => window.location.href = '/area-medico?tab=prescricoes'}
        >
          <FilePlus className="h-4 w-4 mr-2" /> Nova Receita
        </Button>
      </div>
      
      <Tabs defaultValue="ativa" className="mb-6" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="ativa">Ativas</TabsTrigger>
          <TabsTrigger value="expirada">Expiradas</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {loading ? (
        <div className="text-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-hopecann-teal mx-auto" />
          <p>Carregando receitas...</p>
        </div>
      ) : filteredReceitas.length > 0 ? (
        <div className="grid gap-4">
          {filteredReceitas.map(receita => {
            // ... keep existing code (isExpired, dataEmissao, dataValidade, isPdf definitions)
            const dataEmissaoDate = receita.data ? parseISO(receita.data) : null;
            const dataValidadeDate = receita.data_validade ? parseISO(receita.data_validade) : null;
            
            let isExpired = receita.status === 'expirada'; // Default to status
            if (receita.status === 'ativa' && dataValidadeDate && isValid(dataValidadeDate) && new Date() > dataValidadeDate) {
                isExpired = true; // Also consider expired if past validity date and status is still 'ativa'
            }

            const dataEmissao = dataEmissaoDate && isValid(dataEmissaoDate) ? dataEmissaoDate : new Date();
            const dataValidade = dataValidadeDate && isValid(dataValidadeDate) 
                                 ? dataValidadeDate 
                                 : new Date(new Date(dataEmissao).setDate(new Date(dataEmissao).getDate() + 30)); // Default 30 dias se não houver
            const isPdf = !!receita.arquivo_pdf;
            
            return (
              <Card 
                key={receita.id}
                className={`overflow-hidden hover:shadow-md transition-shadow ${isExpired ? 'opacity-70' : ''}`}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className={`${isExpired ? 'bg-gray-500' : 'bg-[#00B3B0]'} p-4 text-white flex items-center justify-center md:w-16`}>
                      {isPdf ? <FileUp className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                    </div>
                    
                    <div className="p-4 flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                        <h3 className="font-medium text-lg">{receita.pacientes_app?.nome || 'Paciente não informado'}</h3>
                        <div className="flex flex-wrap gap-2 mt-1 md:mt-0">
                          {isPdf && (
                            <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">PDF Anexado</span>
                          )}
                          {isExpired && (
                            <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">Expirada</span>
                          )}
                           {!isExpired && receita.status !== 'ativa' && (
                             <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded capitalize">{receita.status}</span>
                           )}
                        </div>
                      </div>
                      
                      <p className="text-gray-800 font-medium mb-1">{receita.medicamento}</p>
                      <p className="text-gray-600 mb-4 text-sm">{receita.posologia}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          Emissão: {format(dataEmissao, "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          Válida até: {format(dataValidade, "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 flex flex-row md:flex-col gap-2 justify-center md:w-48">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewPrescription(receita.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> Visualizar
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDownload(receita)}
                        disabled={isGeneratingPdf && printingData?.prescriptionNumber === `REC-${receita.id}`}
                      >
                        {isGeneratingPdf && printingData?.prescriptionNumber === `REC-${receita.id}` ? 
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 
                          <Download className="h-4 w-4 mr-2" />
                        }
                        Baixar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Nenhuma receita encontrada para os filtros selecionados.</p>
          </CardContent>
        </Card>
      )}
      {/* Hidden template for PDF generation */}
      {/* Container principal para o template de impressão. Será movido para o body durante a geração do PDF se necessário. */}
      <div 
        ref={printTemplateRef} 
        className="print-only-container" 
        style={{ 
          position: 'absolute', 
          left: '-9999px', // Fora da tela
          top: '-9999px',
          zIndex: -1, // Para não interferir com o layout normal
          width: '210mm', // A4 Largura
          height: 'auto', // Altura automática baseada no conteúdo
          backgroundColor: 'white', // Fundo branco
          overflow: 'hidden' // Previne scrollbars inesperadas no container oculto
        }}
      >
        {/* O PrescriptionPrintTemplate será renderizado aqui quando printingData estiver disponível */}
        {printingData && <PrescriptionPrintTemplate data={printingData} />}
      </div>
    </div>
  );
};

export default Receitas;
