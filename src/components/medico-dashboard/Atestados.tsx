
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Download, Printer, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getPacientes, createAtestado } from '@/services/supabaseService';
import html2canvas from 'html2canvas';
import PdfUpload from '@/components/ui/pdf-upload';

const Atestados: React.FC = () => {
  const { toast } = useToast();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assinado, setAssinado] = useState(false);
  const atestadoRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('formulario');
  const [medicoUserId, setMedicoUserId] = useState<number | null>(null);
  const [pdfFilePath, setPdfFilePath] = useState<string | null>(null);

  // Form state
  const [pacienteId, setPacienteId] = useState('');
  const [nomePaciente, setNomePaciente] = useState('');
  const [dataConsulta, setDataConsulta] = useState<Date | undefined>(new Date());
  const [cid, setCid] = useState('');
  const [tempoAfastamento, setTempoAfastamento] = useState('');
  const [unidade, setUnidade] = useState('dias');
  const [justificativa, setJustificativa] = useState('');
  
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

  useEffect(() => {
    if (pacienteId) {
      const paciente = pacientes.find(p => p.id.toString() === pacienteId);
      if (paciente) {
        setNomePaciente(paciente.nome);
      }
    } else {
      setNomePaciente('');
    }
  }, [pacienteId, pacientes]);
  
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
      
      // Criar atestado com referência ao PDF
      const atestadoData = {
        id_paciente: parseInt(pacienteId),
        data_emissao: new Date().toISOString(),
        tempo_afastamento: 0, // Valor especial para indicar que o tempo está no PDF
        unidade_tempo: 'pdf',
        cid: 'Ver documento anexo',
        justificativa: 'Atestado via documento PDF anexado',
        assinado: true,
        arquivo_pdf: pdfFilePath
      };
      
      const newAtestado = await createAtestado(atestadoData);
      
      if (newAtestado) {
        setAssinado(true);
        toast({
          title: "Atestado gerado",
          description: "O atestado com PDF anexo foi gerado com sucesso",
        });
        return;
      }
    }
    
    // Validations
    if (!pacienteId) {
      toast({
        variant: "destructive",
        title: "Paciente obrigatório",
        description: "Por favor, selecione um paciente",
      });
      return;
    }
    
    if (!tempoAfastamento || isNaN(Number(tempoAfastamento))) {
      toast({
        variant: "destructive",
        title: "Tempo de afastamento inválido",
        description: "Por favor, insira um tempo de afastamento válido",
      });
      return;
    }
    
    if (!justificativa) {
      toast({
        variant: "destructive",
        title: "Justificativa obrigatória",
        description: "Por favor, insira uma justificativa para o afastamento",
      });
      return;
    }
    
    const atestadoData = {
      id_paciente: parseInt(pacienteId),
      data_emissao: dataConsulta?.toISOString() || new Date().toISOString(),
      tempo_afastamento: parseInt(tempoAfastamento),
      unidade_tempo: unidade,
      cid,
      justificativa,
      assinado: true
    };
    
    const newAtestado = await createAtestado(atestadoData);
    
    if (newAtestado) {
      setAssinado(true);
      toast({
        title: "Atestado gerado",
        description: "O atestado foi gerado com sucesso",
      });
    }
  };
  
  const handlePdfUploadComplete = (filePath: string) => {
    setPdfFilePath(filePath);
  };
  
  const handleDownloadImage = async () => {
    if (atestadoRef.current) {
      try {
        const canvas = await html2canvas(atestadoRef.current);
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `atestado-${new Date().getTime()}.png`;
        link.click();
        
        toast({
          title: "Download concluído",
          description: "O atestado foi baixado como imagem",
        });
      } catch (error) {
        console.error("Erro ao gerar imagem:", error);
        toast({
          variant: "destructive",
          title: "Erro ao gerar imagem",
          description: "Não foi possível baixar o atestado como imagem",
        });
      }
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Emissão de Atestado Médico</h1>
        <p className="text-gray-600">
          Preencha os dados para gerar o atestado
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
          <TabsTrigger value="formulario">Preencher Formulário</TabsTrigger>
          <TabsTrigger value="pdf">Anexar PDF</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      <Label htmlFor="data-consulta" className="font-medium">
                        Data da Consulta
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full mt-1 justify-start text-left font-normal",
                              !dataConsulta && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dataConsulta ? format(dataConsulta, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dataConsulta}
                            onSelect={setDataConsulta}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label htmlFor="cid" className="font-medium">
                        CID (Opcional)
                      </Label>
                      <Input
                        id="cid"
                        placeholder="Ex: F41.1"
                        value={cid}
                        onChange={(e) => setCid(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tempo-afastamento" className="font-medium">
                          Tempo de Afastamento*
                        </Label>
                        <Input
                          id="tempo-afastamento"
                          type="number"
                          placeholder="Duração"
                          value={tempoAfastamento}
                          onChange={(e) => setTempoAfastamento(e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="unidade" className="font-medium">
                          Unidade
                        </Label>
                        <Select value={unidade} onValueChange={setUnidade}>
                          <SelectTrigger id="unidade" className="mt-1">
                            <SelectValue placeholder="Selecione a unidade" />
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
                      <Label htmlFor="justificativa" className="font-medium">
                        Justificativa*
                      </Label>
                      <Textarea
                        id="justificativa"
                        placeholder="Motivo do afastamento"
                        value={justificativa}
                        onChange={(e) => setJustificativa(e.target.value)}
                        className="mt-1 min-h-[100px]"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <PdfUpload 
                    onUploadComplete={handlePdfUploadComplete} 
                    userId={medicoUserId} 
                    pacienteId={pacienteId ? parseInt(pacienteId) : null}
                    docType="atestado"
                  />
                )}
                
                <div className="flex justify-end pt-4 gap-4">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={(activeTab === 'pdf' && !pdfFilePath)}
                  >
                    Gerar Atestado
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {assinado && (
          <div className="md:w-1/2 print:w-full bg-white p-6 border rounded-lg shadow-sm">
            <div ref={atestadoRef} className="p-6 print:p-0 min-h-[500px]">
              <div className="text-center border-b pb-4 mb-6">
                <h2 className="text-xl font-bold text-blue-800">ATESTADO MÉDICO</h2>
                <p className="text-sm text-gray-600 mt-1">Doc. Nº {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
              </div>
              
              <div className="mb-6">
                <p className="font-medium">Paciente: <span className="font-normal">{nomePaciente}</span></p>
                <p className="font-medium mt-2">Data: <span className="font-normal">{dataConsulta ? format(dataConsulta, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span></p>
                {cid && <p className="font-medium mt-2">CID: <span className="font-normal">{cid}</span></p>}
              </div>
              
              {activeTab === 'formulario' ? (
                <div className="mb-8">
                  <p className="mb-4">
                    Atesto para os devidos fins que o(a) paciente acima identificado(a) deverá 
                    permanecer afastado(a) de suas atividades habituais por um período 
                    de <strong>{tempoAfastamento} {unidade}</strong>, a partir da presente data.
                  </p>
                  
                  <p className="mb-4"><strong>Justificativa:</strong> {justificativa}</p>
                </div>
              ) : (
                <div className="mb-8">
                  <p className="mb-4">
                    Atesto para os devidos fins que o(a) paciente acima identificado(a) deverá 
                    permanecer afastado(a) de suas atividades habituais conforme informações 
                    detalhadas no documento PDF anexo a este atestado.
                  </p>
                </div>
              )}
              
              <div className="mt-12 pt-8 border-t text-center">
                <div className="w-64 mx-auto border-b border-black pb-1">
                  <p className="font-medium text-sm">Assinatura e Carimbo do Médico</p>
                </div>
                <p className="mt-2 text-sm">CRM: 12345 - RJ</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-6 print:hidden">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" /> Imprimir
              </Button>
              <Button onClick={handleDownloadImage}>
                <Download className="h-4 w-4 mr-2" /> Baixar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Atestados;
