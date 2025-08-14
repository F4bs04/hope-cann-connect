
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPacientes, createLaudo } from '@/services/supabaseService';
import PdfUpload from '@/components/ui/pdf-upload';
import { supabase } from '@/integrations/supabase/client';

const Laudos: React.FC = () => {
  const { toast } = useToast();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assinado, setAssinado] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('formulario');
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [uploaderId, setUploaderId] = useState<number | null>(null);
  const [pdfFilePath, setPdfFilePath] = useState<string | null>(null);

  // Form state
  const [pacienteId, setPacienteId] = useState('');
  const [tipoLaudo, setTipoLaudo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Carregar pacientes do médico atual
        const { data: user } = await supabase.auth.getUser();
        const data = await getPacientes(user.user?.id);
        setPacientes(data);

        // Obter doctor_id (uuid)
        const { data: doctor } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.user?.id)
          .maybeSingle();
        if (doctor?.id) setDoctorId(doctor.id);

        // Gerar um identificador numérico estável para upload (necessário pelo componente PdfUpload)
        if (user.user?.id) {
          const numericId = Array.from(user.user.id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
          setUploaderId(numericId);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  
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
      
      const laudoData: any = {
        patient_id: pacienteId,
        document_type: 'medical_report',
        title: 'Laudo médico (PDF anexo)',
        content: observacoes || 'Documento PDF anexado pelo médico',
        is_signed: true,
        file_path: pdfFilePath,
        issued_at: new Date().toISOString(),
      };
      if (doctorId) laudoData.doctor_id = doctorId;
      const result = await createLaudo(laudoData);
      if (result?.success) {
        setSuccess(true);
      }
      return;
    }
    
    // Validações para o formulário unificado
    if (!pacienteId) {
      toast({
        variant: "destructive",
        title: "Paciente obrigatório",
        description: "Por favor, selecione um paciente",
      });
      return;
    }

    if (!conteudo.trim()) {
      toast({
        variant: "destructive",
        title: "Conteúdo obrigatório",
        description: "Digite o texto do laudo",
      });
      return;
    }

    if (!assinado) {
      toast({
        variant: "destructive",
        title: "Assinatura obrigatória",
        description: "Por favor, assine digitalmente o laudo",
      });
      return;
    }

    const laudoData: any = {
      patient_id: pacienteId,
      document_type: 'medical_report',
      title: tipoLaudo ? `Laudo ${tipoLaudo}` : 'Laudo médico',
      content: conteudo,
      is_signed: true,
      issued_at: new Date().toISOString(),
    };
    if (doctorId) laudoData.doctor_id = doctorId;

    const result = await createLaudo(laudoData);

    if (result?.success) {
      setSuccess(true);
    }
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
        <h2 className="text-2xl font-bold mb-2">Laudo Gerado com Sucesso</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          O laudo médico foi gerado e está disponível para impressão ou download.
        </p>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            size="lg"
            className="flex items-center"
            onClick={() => window.print()}
          >
            <FileText className="mr-2 h-5 w-5" />
            Imprimir Laudo
          </Button>
          <Button 
            size="lg"
            className="flex items-center"
            onClick={() => {
              toast({
                title: "Download iniciado",
                description: "O laudo está sendo baixado",
              });
              
              // Simulate download
              setTimeout(() => {
                toast({
                  title: "Download concluído",
                  description: "O laudo foi baixado com sucesso",
                });
              }, 1500);
            }}
          >
            <Download className="mr-2 h-5 w-5" />
            Baixar PDF
          </Button>
        </div>
        <Button 
          variant="link" 
          className="mt-4"
          onClick={() => {
            setSuccess(false);
            setAssinado(false);
            setTipoLaudo('');
            setConteudo('');
            setObservacoes('');
            setPacienteId('');
            setPdfFilePath(null);
            setActiveTab('formulario');
          }}
        >
          Emitir novo laudo
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Emissão de Laudo Médico</h1>
        <p className="text-gray-600">
          Preencha todos os campos obrigatórios para gerar o laudo
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
          <TabsTrigger value="formulario">Preencher Formulário</TabsTrigger>
          <TabsTrigger value="pdf">Anexar PDF</TabsTrigger>
        </TabsList>
      </Tabs>
      
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
                  <Label htmlFor="tipo-laudo" className="font-medium">
                    Tipo de Laudo*
                  </Label>
                  <Select value={tipoLaudo} onValueChange={setTipoLaudo} required>
                    <SelectTrigger id="tipo-laudo" className="mt-1">
                      <SelectValue placeholder="Selecione o tipo de laudo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pericial">Laudo Pericial</SelectItem>
                      <SelectItem value="medico">Laudo Médico</SelectItem>
                      <SelectItem value="psicologico">Laudo Psicológico</SelectItem>
                      <SelectItem value="neuropsicologico">Laudo Neuropsicológico</SelectItem>
                      <SelectItem value="fisioterapeutico">Laudo Fisioterapêutico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="conteudo" className="font-medium">
                    Conteúdo do Laudo*
                  </Label>
                  <Textarea
                    id="conteudo"
                    placeholder="Digite todo o conteúdo do laudo médico de forma livre. Inclua objetivo, descrição clínica detalhada, conclusões e qualquer informação relevante."
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    className="mt-1 min-h-[300px]"
                    required
                  />
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
                  <div className="mt-1 border-2 rounded-md overflow-hidden">
                    {assinado ? (
                      <div className="bg-green-50 border-green-200 p-6 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="h-6 w-6 text-green-600" />
                          </div>
                          <span className="text-green-800 font-medium">Documento assinado digitalmente</span>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="mt-2"
                            onClick={() => setAssinado(false)}
                          >
                            Remover assinatura
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-dashed p-8 flex flex-col items-center justify-center text-center text-gray-500 cursor-pointer hover:bg-gray-50" onClick={() => setAssinado(true)}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 text-gray-400">
                          <path d="M15.5 8.5C15.5 8.5 15 11 12 11M12 11C9 11 8.5 8.5 8.5 8.5M12 11V15.5M7 16.5H17M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Clique para assinar digitalmente</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="observacoes-pdf" className="font-medium">
                    Observações
                  </Label>
                  <Textarea
                    id="observacoes-pdf"
                    placeholder="Observações adicionais"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <PdfUpload 
                  onUploadComplete={handlePdfUploadComplete} 
                  userId={uploaderId} 
                  pacienteId={pacienteId ? parseInt(pacienteId) : null}
                  docType="laudo"
                />
              </>
            )}
            
            <div className="flex justify-between pt-4">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 flex-1 mr-2"
                disabled={(activeTab === 'formulario' && !assinado) || (activeTab === 'pdf' && !pdfFilePath)}
              >
                Gerar Laudo
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 ml-2"
                onClick={() => window.location.reload()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Todos os campos marcados com * são obrigatórios</p>
      </div>
    </div>
  );
};

export default Laudos;
