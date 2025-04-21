import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Download, Printer, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getPacientes, createAtestado } from '@/services/supabaseService';
import html2canvas from 'html2canvas';

const Atestados: React.FC = () => {
  const { toast } = useToast();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assinado, setAssinado] = useState(false);
  const atestadoRef = useRef<HTMLDivElement>(null);

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
                      placeholder="Quantidade"
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
                    Justificativa Médica*
                  </Label>
                  <Textarea
                    id="justificativa"
                    placeholder="Descreva a justificativa para o afastamento"
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    className="mt-1 min-h-[150px]"
                    required
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
                
                <div className="flex justify-between pt-4 items-center">
                  <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                    Cancelar
                  </Button>
                  
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={!assinado}>
                    Gerar PDF do Atestado
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <div className="sticky top-4">
            <h3 className="text-xl font-medium mb-4">Prévia do Atestado</h3>
            
            <Card className="bg-white p-8 border shadow relative">
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownloadImage}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              
              <div
                ref={atestadoRef}
                className="p-4"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  boxSizing: 'border-box',
                  background: 'white',
                  overflow: 'hidden',
                  margin: '0 auto',
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                  '@media print': {
                    width: '210mm',
                    minHeight: '297mm',
                    boxShadow: 'none',
                    margin: 0,
                  },
                }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold">Atestado Médico</h2>
                  <p className="text-sm text-gray-500">
                    Data: {dataConsulta ? format(dataConsulta, "dd/MM/yyyy") : format(new Date(), "dd/MM/yyyy")}
                  </p>
                </div>
                
                <div className="space-y-6 text-gray-900">
                  <p>
                    Atesto para os devidos fins que o(a) paciente {nomePaciente || "_____________"}, 
                    necessita de afastamento de suas atividades por um período de {tempoAfastamento || "__"} {unidade || "dias"}.
                  </p>
                  
                  {justificativa && (
                    <p>
                      <strong>Justificativa:</strong> {justificativa}
                    </p>
                  )}
                  
                  {cid && (
                    <p>CID: {cid}</p>
                  )}
                  
                  <div className="mt-20 text-center">
                    <div className="border-t border-gray-300 w-48 mx-auto pt-2">
                      <p>Dr. Ricardo Silva</p>
                      <p className="text-sm">CRM 123456</p>
                    </div>
                    <div className="mt-2">
                      {assinado && (
                        <img 
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGASURBVHgB7ZThUcJAEIW/JaGAowMowXSgHWgH2gF2IFagdqAdYAViB9qBdOA40vHYzYXhsrkQ/MPM8M3cJHe3u2/f7iUQufDtdVsZQRuiNhE1OJGQrWAuGEsyeRGENhJYHJA73ASA77DIi8B8BLYGOm73L6Yw+Ys457wCRl8KAJOQpZmDFDT53WNE1Dvrq7TnYiFnFJnVWfCg61Lq+ZLl9htIGtXj1j0YqzY57E9hfgOvnuxTn8M3+vdCe3F5g7YNs0FDkUCaOcyvYSLvzj0VacG9DgA39h9zKoECDxrSJk04qVONYXHAY/x4oT0/R/Y3pA2Jd3FHOe51TYvLMRvxVD8VVYI5OA/ZYYFHKfzwz3hxkXsZ96V9qCCtxqHMraDvZBpwHIFbKVJ9G4RWlVyNFfxewLJHQRZiUKSk+cGyEGftTuLsFa1cVf2kw7/aqP0Qy3tZO3fVZYA1dCW7kIcfapBL1Xwo+Cn3i0VUleSRPBbLkl2ICeX9MlvJM/kBJkhNe2WbVqsAAAAASUVORK5CYII=" 
                          alt="Assinatura digital" 
                          className="h-10 mx-auto"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Atestados;
