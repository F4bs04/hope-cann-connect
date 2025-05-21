
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// Label não é usado, removido
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FilePlus, FileText, Calendar, Download, Eye, FileUp, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { getReceitas, downloadDocument } from '@/services/supabaseService'; // getDocumentUrl não é usado
import { getMedicoDetailsById } from '@/services/medicos/medicosService'; // Novo import
import { PrescriptionData, DoctorInfo, PatientInfo, MedicationItem } from '@/types/prescription'; // Novos imports
import PrescriptionPrintTemplate from './PrescriptionPrintTemplate'; // Novo import
import jsPDF from 'jspdf'; // Novo import
import html2canvas from 'html2canvas'; // Novo import
// supabase não é usado diretamente aqui, removido


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
      const [receitasData, medicoIdStr] = await Promise.all([
        getReceitas(),
        localStorage.getItem("userId")
      ]);
      
      setReceitas(receitasData);

      if (medicoIdStr) {
        const medicoId = parseInt(medicoIdStr, 10);
        if (!isNaN(medicoId)) {
          const drInfo = await getMedicoDetailsById(medicoId);
          setDoctorInfo(drInfo);
        }
      }
      setLoading(false);
    };
    
    loadInitialData();
  }, []);

  useEffect(() => {
    if (printingData && printTemplateRef.current && doctorInfo) {
      generateAndDownloadPdf();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printingData, doctorInfo]); // Dependência em doctorInfo também é importante
  
  const filteredReceitas = receitas.filter(receita => 
    (receita.pacientes_app?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    receita.medicamento?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedTab === 'todas' || receita.status === selectedTab)
  );

  const formatDateForPrescription = (dateString: string | Date | null): string => {
    if (!dateString) return 'N/A';
    try {
      // Se for string 'yyyy-MM-dd' ou Date object
      return format(parseISO(dateString.toString()), 'dd/MM/yyyy');
    } catch (e) {
      // Se já estiver formatado ou for inválido
      return dateString.toString();
    }
  };

  const generateAndDownloadPdf = async () => {
    if (!printingData || !printTemplateRef.current || !doctorInfo) {
      toast({ variant: "destructive", title: "Erro", description: "Dados insuficientes para gerar PDF." });
      setPrintingData(null); // Reset para evitar loops
      setIsGeneratingPdf(false);
      return;
    }
    
    setIsGeneratingPdf(true);
    toast({ title: "Gerando PDF...", description: "Aguarde um momento." });

    const printNode = printTemplateRef.current;
    
    // Forçar a visibilidade temporária para captura
    const originalStyles = {
      display: printNode.style.display,
      position: printNode.style.position,
      left: printNode.style.left,
      top: printNode.style.top,
      zIndex: printNode.style.zIndex,
      width: printNode.style.width,
      height: printNode.style.height,
      backgroundColor: printNode.style.backgroundColor,
    };

    printNode.style.display = 'block';
    printNode.style.position = 'absolute';
    printNode.style.left = '0px'; // Renderizar no viewport para fontes e estilos corretos
    printNode.style.top = '0px';
    printNode.style.zIndex = '10000';
    printNode.style.width = '210mm';
    printNode.style.height = 'auto'; // Ou minHeight: '297mm'
    printNode.style.backgroundColor = 'white';


    // Adiciona um pequeno delay para garantir que o DOM foi atualizado e renderizado
    await new Promise(resolve => setTimeout(resolve, 500));


    try {
      const canvas = await html2canvas(printNode.querySelector('.printable-prescription') as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
         onclone: (documentClone) => {
            const clonedPrintNode = documentClone.documentElement.querySelector('.print-only-container');
            if (clonedPrintNode) {
               Object.assign((clonedPrintNode as HTMLElement).style, {
                  display: 'block', width: '210mm', minHeight: '297mm', height: 'auto', padding: '0', margin: '0', backgroundColor: 'white',
               });
            }
            const printArea = documentClone.documentElement.querySelector('.printable-prescription');
            if (printArea) {
              Object.assign((printArea as HTMLElement).style, {
                display: 'block', visibility: 'visible', position: 'relative', width: '210mm', minHeight: '297mm', height: 'auto', margin: '0 auto', padding: '15mm', boxSizing: 'border-box', backgroundColor: 'white', color: 'black', fontFamily: "'Times New Roman', Times, serif", fontSize: '12pt', border: 'none', boxShadow: 'none',
              });
            }
          }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const aspectRatio = imgProps.width / imgProps.height;
      let imgHeight = pdfHeight;
      let imgWidth = imgHeight * aspectRatio;
      if (imgWidth > pdfWidth) {
        imgWidth = pdfWidth;
        imgHeight = imgWidth / aspectRatio;
      }
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      pdf.save(`receita-${printingData.prescriptionNumber || printingData.patient.name.replace(/\s/g, '_')}-${Date.now()}.pdf`);
      toast({ title: "PDF Gerado", description: "O PDF da receita foi baixado." });
    } catch (error) {
      console.error("Erro ao gerar PDF com html2canvas:", error);
      toast({ variant: "destructive", title: "Erro ao Gerar PDF", description: "Não foi possível gerar o PDF." });
    } finally {
      // Restaurar estilos originais e limpar
      Object.assign(printNode.style, originalStyles);
      printNode.style.left = '-9999px'; // Mover de volta para fora da tela
      printNode.style.top = '-9999px';
      printNode.style.zIndex = '-1';
      setPrintingData(null);
      setIsGeneratingPdf(false);
    }
  };

  const handleDownload = async (receita: any) => {
    if (isGeneratingPdf) {
      toast({ title: "Aguarde", description: "Outro PDF está sendo gerado." });
      return;
    }

    if (receita.arquivo_pdf) {
      toast({ title: "Download iniciado", description: "O arquivo PDF existente está sendo baixado." });
      try {
        const fileName = receita.arquivo_pdf.split('/').pop() || `receita-${receita.id}.pdf`;
        const success = await downloadDocument(receita.arquivo_pdf, fileName);
        if (success) {
          toast({ title: "Download concluído", description: "O PDF foi baixado com sucesso." });
        }
      } catch (error) {
        console.error("Erro ao baixar PDF existente:", error);
        toast({ variant: "destructive", title: "Erro no download", description: "Não foi possível baixar o PDF." });
      }
    } else {
      // Gerar PDF dinamicamente
      if (!doctorInfo) {
        toast({ variant: "destructive", title: "Erro", description: "Informações do médico não carregadas. Tente novamente." });
        return;
      }
      if (!receita.pacientes_app) {
        toast({ variant: "destructive", title: "Erro", description: "Informações do paciente não encontradas na receita." });
        return;
      }

      const paciente = receita.pacientes_app;
      const patientData: PatientInfo = {
        name: paciente.nome || 'Paciente Desconhecido',
        cpf: paciente.cpf || 'N/A', // Supondo que cpf está em pacientes_app
        birthDate: formatDateForPrescription(paciente.data_nascimento),
        address: paciente.endereco || '',
        phone: paciente.telefone || '',
      };

      const medicationData: MedicationItem[] = [{
        id: receita.id.toString(),
        name: receita.medicamento || "Medicamento não especificado",
        // Para dosage e quantity, podemos usar placeholders ou tentar extrair da posologia se houver um padrão
        dosage: "", // Ex: "1 comprimido", "10mg". Se não tiver, deixar vazio ou um placeholder.
        quantity: "", // Ex: "30 comprimidos", "1 frasco". Se não tiver, deixar vazio.
        instructions: receita.posologia || "Seguir orientação médica.",
      }];
      
      const fullPrescriptionData: PrescriptionData = {
        doctor: doctorInfo,
        patient: patientData,
        prescriptionDate: formatDateForPrescription(receita.data),
        medications: medicationData,
        generalInstructions: receita.observacoes || "",
        prescriptionNumber: `REC-${receita.id}`,
      };
      
      setPrintingData(fullPrescriptionData);
      // O useEffect [printingData] vai chamar generateAndDownloadPdf()
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
          <TabsTrigger value="expirada">Expiradas</TabsTrigger> {/* Mantive 'expirada' como valor, não 'Expirada' */}
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
            const isExpired = receita.status === 'expirada';
            // parseISO é mais robusto para datas que podem já ser objetos Date ou strings ISO
            const dataEmissao = receita.data ? parseISO(receita.data) : new Date(); 
            const dataValidade = receita.data_validade ? parseISO(receita.data_validade) : new Date(dataEmissao.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 dias se não houver
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
      <div ref={printTemplateRef} className="print-only-container" style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -1, width: '210mm', height: 'auto', backgroundColor: 'white' }}>
        {printingData && <PrescriptionPrintTemplate data={printingData} />}
      </div>
    </div>
  );
};

export default Receitas;

