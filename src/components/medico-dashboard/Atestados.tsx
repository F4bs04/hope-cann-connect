
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const Atestados: React.FC = () => {
  const [nomePaciente, setNomePaciente] = useState('');
  const [dataConsulta, setDataConsulta] = useState<Date | undefined>(new Date());
  const [cid, setCid] = useState('');
  const [tempoAfastamento, setTempoAfastamento] = useState('');
  const [unidade, setUnidade] = useState('dias');
  const [justificativa, setJustificativa] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the certificate submission
    console.log({
      nomePaciente,
      dataConsulta,
      cid,
      tempoAfastamento,
      unidade,
      justificativa
    });
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
                  <Label htmlFor="nome-paciente" className="font-medium">
                    Nome do Paciente
                  </Label>
                  <Input
                    id="nome-paciente"
                    placeholder="Nome completo do paciente"
                    value={nomePaciente}
                    onChange={(e) => setNomePaciente(e.target.value)}
                    className="mt-1"
                    required
                  />
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
                      Tempo de Afastamento
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
                    Justificativa Médica
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
                  <div className="border-2 border-dashed rounded-md p-8 mt-1 flex flex-col items-center justify-center text-center text-gray-500 cursor-pointer hover:bg-gray-50">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 text-gray-400">
                      <path d="M15.5 8.5C15.5 8.5 15 11 12 11M12 11C9 11 8.5 8.5 8.5 8.5M12 11V15.5M7 16.5H17M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Clique para assinar digitalmente</span>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4 items-center">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                  
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
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
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold">Atestado Médico</h2>
                <p className="text-sm text-gray-500">Data: {dataConsulta ? format(dataConsulta, "dd/MM/yyyy") : "15/02/2025"}</p>
              </div>
              
              <div className="space-y-6 text-gray-900">
                <p>
                  Atesto para os devidos fins que o(a) paciente {nomePaciente || "_____________"}, necessita de afastamento de suas atividades por um período de {tempoAfastamento || "__"} {unidade || "dias"}.
                </p>
                
                {cid && (
                  <p>CID: {cid}</p>
                )}
                
                <div className="mt-20 text-center">
                  <div className="border-t border-gray-300 w-48 mx-auto pt-2">
                    <p>Dr. Ricardo Silva</p>
                    <p className="text-sm">CRM 123456</p>
                  </div>
                  <div className="mt-2">
                    <img 
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGASURBVHgB7ZThUcJAEIW/JaGAowMowXSgHWgH2gF2IFagdqAdYAViB9qBdOA40vHYzYXhsrkQ/MPM8M3cJHe3u2/f7iUQufDtdVsZQRuiNhE1OJGQrWAuGEsyeRGENhJYHJA73ASA77DIi8B8BLYGOm73L6Yw+Ys457wCRl8KAJOQpZmDFDT53WNE1Dvrq7TnYiFnFJnVWfCg61Lq+ZLl9htIGtXj1j0YqzY57E9hfgOvnuxTn8M3+vdCe3F5g7YNs0FDkUCaOcyvYSLvzj0VacG9DgA39h9zKoECDxrSJk04qVONYXHAY/x4oT0/R/Y3pA2Jd3FHOe51TYvLMRvxVD8VVYI5OA/ZYYFHKfzwz3hxkXsZ96V9qCCtxqHMraDvZBpwHIFbKVJ9G4RWlVyNFfxewLJHQRZiUKSk+cGyEGftTuLsFa1cVf2kw7/aqP0Qy3tZO3fVZYA1dCW7kIcfapBL1Xwo+Cn3i0VUleSRPBbLkl2ICeX9MlvJM/kBJkhNe2WbVqsAAAAASUVORK5CYII=" 
                      alt="Assinatura digital" 
                      className="h-10 mx-auto"
                    />
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                <div className="border border-gray-200 px-2 py-1 rounded">
                  IMG<br />98×96
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
