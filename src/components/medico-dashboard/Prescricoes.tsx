
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Check, Download, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPacientes, createReceita } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';
import PdfUpload from '@/components/ui/pdf-upload';
import html2pdf from 'html2pdf.js';
import DocumentConfirmationDialog from '@/components/ui/document-confirmation-dialog';
import { createDocumentNotification } from '@/services/notifications/notificationService';
import { SendToPatientDialog } from './SendToPatientDialog';

const Prescricoes: React.FC = () => {
  const { toast } = useToast();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('formulario');
  const [medicoUserId, setMedicoUserId] = useState<number | null>(null);
  const [pdfFilePath, setPdfFilePath] = useState<string | null>(null);

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
  const [receitaRef, setReceitaRef] = useState<React.RefObject<HTMLDivElement>>(React.createRef());
  const [lastGeneratedReceita, setLastGeneratedReceita] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pendingReceitaData, setPendingReceitaData] = useState<any>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [generatedPrescriptionId, setGeneratedPrescriptionId] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>('Médico');
  const [doctorCRM, setDoctorCRM] = useState<string>('');
  const [signatureId, setSignatureId] = useState<string>('');
  
  useEffect(() => {
    const loadPacientes = async () => {
      setLoading(true);
      try {
        // Buscar o UUID do médico logado
        const { data: user } = await supabase.auth.getUser();
        if (user?.user?.id) {
          const data = await getPacientes(user.user.id);
          setPacientes(data);

          try {
            // Carregar nome do médico e CRM
            const userId = user.user.id;
            setSignatureId(`DR-${userId.slice(0, 8)}`);

            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', userId)
              .maybeSingle();
            if (profile?.full_name) setDoctorName(profile.full_name);

            const { data: doctor } = await supabase
              .from('doctors')
              .select('crm')
              .eq('user_id', userId)
              .maybeSingle();
            if (doctor?.crm) setDoctorCRM(doctor.crm);
          } catch (e) {
            console.warn('Não foi possível carregar dados do médico para assinatura/CRM');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
      }
      setLoading(false);
    };
    
    loadPacientes();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!pacienteId) {
      toast({
        variant: "destructive",
        title: "Paciente obrigatório",
        description: "Por favor, selecione um paciente",
      });
      return;
    }

    // Preparar dados baseado na aba ativa
    let receitaData;
    let pacienteSelecionado = pacientes.find(p => p.id.toString() === pacienteId);

    if (activeTab === 'pdf' && pdfFilePath) {
      // PDF anexado
      const dataValidade = new Date();
      dataValidade.setDate(dataValidade.getDate() + 30);
      
      receitaData = {
        id_paciente: parseInt(pacienteId),
        medicamento: "Receita via PDF anexado",
        posologia: "Ver documento anexo",
        observacoes: "Documento PDF anexado pelo médico",
        data_validade: dataValidade.toISOString(),
        status: 'ativa',
        arquivo_pdf: pdfFilePath,
        paciente: pacienteSelecionado,
        tipoReceita: 'pdf',
        tempoUso: '',
        periodo: '',
        dataEmissao: new Date().toISOString()
      };
    } else {
      // Formulário normal - validações específicas
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
      
      receitaData = {
        id_paciente: parseInt(pacienteId),
        medicamento,
        posologia,
        observacoes: `Tempo de uso: ${tempoUso} ${periodo}. ${permiteSubstituicao === 'sim' ? 'Permite substituição. ' : 'Não permite substituição. '}${observacoes ? observacoes : ''}`,
        data_validade: dataValidade.toISOString(),
        status: 'ativa',
        paciente: pacienteSelecionado,
        tipoReceita,
        tempoUso,
        periodo,
        dataEmissao: new Date().toISOString()
      };
    }

    // Mostrar dialog de confirmação
    setPendingReceitaData(receitaData);
    setShowConfirmDialog(true);
  };

  const handleConfirmDocument = async () => {
    if (!pendingReceitaData) return;

    setIsGeneratingPdf(true);
    
    try {
      // Criar receita no banco
      const newReceita = await createReceita(pendingReceitaData);
      
      if (newReceita) {
        // Criar notificação para o paciente
        if (pendingReceitaData.paciente?.user_id) {
          const { data: user } = await supabase.auth.getUser();
          const doctorName = user?.user?.user_metadata?.full_name || 'Médico';
          
          if (newReceita && 'data' in newReceita && newReceita.data?.id) {
            await createDocumentNotification(
              pendingReceitaData.paciente.user_id,
              doctorName,
              'receita',
              newReceita.data.id.toString()
            );
          }
        }
        
        // Salvar ID da receita gerada
        if (newReceita && 'data' in newReceita && newReceita.data?.id) {
          setGeneratedPrescriptionId(newReceita.data.id.toString());
        }
        
        // Preparar dados para exibição e PDF
        setLastGeneratedReceita(pendingReceitaData);
        setSuccess(true);
        setShowConfirmDialog(false);
        setPendingReceitaData(null);
        
        // Gerar e abrir PDF automaticamente
        setTimeout(async () => {
          await generateAndOpenPDF();
        }, 1000);
        
        toast({
          title: "Receita criada com sucesso",
          description: "O documento foi gerado e uma notificação foi enviada ao paciente",
        });
        
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar receita",
        description: "Não foi possível criar a receita. Tente novamente.",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
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

  const generateAndOpenPDF = async () => {
    if (receitaRef.current && lastGeneratedReceita) {
      try {
        const element = receitaRef.current;
        const pacienteNome = lastGeneratedReceita.paciente?.full_name || lastGeneratedReceita.paciente?.nome || 'paciente';
        const opt = {
          margin: 1,
          filename: `receita-${pacienteNome.replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        // Gerar PDF como blob
        const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
        
        // Criar URL do blob e abrir em nova aba
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
        
        // Limpar URL após um tempo
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
        
        toast({
          title: "PDF gerado com sucesso",
          description: "O documento foi aberto em uma nova aba",
        });
      } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        toast({
          variant: "destructive",
          title: "Erro ao gerar PDF",
          description: "Não foi possível gerar o PDF",
        });
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (receitaRef.current && lastGeneratedReceita) {
      try {
        const element = receitaRef.current;
        const pacienteNome = lastGeneratedReceita.paciente?.full_name || lastGeneratedReceita.paciente?.nome || 'paciente';
        const opt = {
          margin: 1,
          filename: `receita-${pacienteNome.replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        await html2pdf().set(opt).from(element).save();
        
        toast({
          title: "Download concluído",
          description: "A receita foi baixada como PDF",
        });
      } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        toast({
          variant: "destructive",
          title: "Erro ao gerar PDF",
          description: "Não foi possível baixar a receita como PDF",
        });
      }
    }
  };
  
  if (success && lastGeneratedReceita) {
    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-green-100 rounded-full p-4 mb-4">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Receita Gerada com Sucesso</h2>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              A receita foi gerada e está disponível para impressão ou download.
            </p>
            <div className="flex flex-col gap-4 w-full max-w-md">
              <Button 
                variant="outline" 
                size="lg"
                className="flex items-center justify-center"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-5 w-5" />
                Imprimir Receita
              </Button>
              <Button 
                size="lg"
                className="flex items-center justify-center"
                onClick={handleDownloadPDF}
              >
                <Download className="mr-2 h-5 w-5" />
                Baixar PDF
              </Button>
              <Button 
                variant="secondary"
                size="lg"
                className="flex items-center justify-center"
                onClick={() => setShowSendDialog(true)}
              >
                <Send className="mr-2 h-5 w-5" />
                Enviar ao Paciente
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => {
                  setSuccess(false);
                  setLastGeneratedReceita(null);
                  resetForm();
                }}
              >
                Criar Nova Receita
              </Button>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/2 print:w-full bg-white p-6 border rounded-lg shadow-sm">
          <div ref={receitaRef} className="p-6 print:p-0 min-h-[600px]">
            <div className="text-center border-b pb-4 mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <img src="/lovable-uploads/Logo.png" alt="Hopecann - Logo" className="h-8 w-auto" />
                <h2 className="text-xl font-bold text-blue-800">RECEITA MÉDICA</h2>
              </div>
              <p className="text-sm text-gray-600">Doc. Nº {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
            </div>
            
            <div className="mb-6">
              <p className="font-medium">Paciente: <span className="font-normal">{lastGeneratedReceita.paciente?.full_name || lastGeneratedReceita.paciente?.nome || 'Nome não informado'}</span></p>
              <p className="font-medium mt-2">Data: <span className="font-normal">{new Date(lastGeneratedReceita.dataEmissao).toLocaleDateString('pt-BR')}</span></p>
            </div>
            
            <div className="mb-8">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-lg mb-3">PRESCRIÇÃO</h3>
                
                <div className="mb-4">
                  <p className="font-medium text-blue-800 text-lg">{lastGeneratedReceita.medicamento}</p>
                </div>
                
                <div className="mb-4">
                  <p className="font-medium">Posologia:</p>
                  <p className="ml-4">{lastGeneratedReceita.posologia}</p>
                </div>
                
                <div className="mb-4">
                  <p className="font-medium">Tempo de uso:</p>
                  <p className="ml-4">{lastGeneratedReceita.tempoUso} {lastGeneratedReceita.periodo}</p>
                </div>
                
                <div className="mb-4">
                  <p className="font-medium">Tipo de receita:</p>
                  <p className="ml-4 capitalize">{lastGeneratedReceita.tipoReceita}</p>
                </div>
                
                {lastGeneratedReceita.observacoes && (
                  <div className="mb-4">
                    <p className="font-medium">Observações:</p>
                    <p className="ml-4">{lastGeneratedReceita.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t text-center">
              <div className="w-64 mx-auto border-b border-black pb-1">
                <p className="font-medium text-sm">Assinatura e Carimbo do Médico</p>
              </div>
              <p className="mt-2 text-sm">CRM: 12345 - RJ</p>
            </div>
          </div>
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
                      {paciente.full_name || 'Nome não informado'} ({paciente.birth_date ? new Date().getFullYear() - new Date(paciente.birth_date).getFullYear() : 'N/A'} anos)
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
                disabled={(activeTab === 'formulario' && !assinado) || (activeTab === 'pdf' && !pdfFilePath)}
              >
                Gerar Receita
              </Button>
              
              <Button type="button" variant="outline" className="w-full md:w-auto mt-2 md:mt-0">
                <Printer className="h-4 w-4 mr-2" /> Imprimir
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Este sistema está em conformidade com as regulamentações da ANVISA</p>
        <p>© 2025 Sistema de Prescrição Digital. Todos os direitos reservados.</p>
      </div>

      <DocumentConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmDocument}
        documentData={pendingReceitaData || {
          paciente: { full_name: '' },
          medicamento: '',
          posologia: '',
          observacoes: '',
          tipoReceita: '',
          tempoUso: '',
          periodo: ''
        }}
        documentType="receita"
        isGenerating={isGeneratingPdf}
      />

      <SendToPatientDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        prescriptionData={lastGeneratedReceita}
        prescriptionId={generatedPrescriptionId}
      />
    </div>
  );
};

export default Prescricoes;
