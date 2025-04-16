
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Printer } from 'lucide-react';

const Prescricoes: React.FC = () => {
  const [medicamento, setMedicamento] = useState('');
  const [posologia, setPosologia] = useState('');
  const [tempoUso, setTempoUso] = useState('');
  const [periodo, setPeriodo] = useState('dias');
  const [permiteSubstituicao, setPermiteSubstituicao] = useState('não');
  const [cid, setCid] = useState('');
  const [tipoReceita, setTipoReceita] = useState('simples');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the prescription submission
    console.log({
      medicamento,
      posologia,
      tempoUso,
      periodo,
      permiteSubstituicao,
      cid,
      tipoReceita
    });
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prescrição Digital</h1>
        <p className="text-gray-600">
          Sistema integrado com ANVISA
        </p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label className="font-medium">
                Assinatura Digital*
              </Label>
              <div className="border-2 border-dashed rounded-md p-8 mt-1 flex flex-col items-center justify-center text-center text-gray-500 cursor-pointer hover:bg-gray-50">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 text-gray-400">
                  <path d="M15.5 8.5C15.5 8.5 15 11 12 11M12 11C9 11 8.5 8.5 8.5 8.5M12 11V15.5M7 16.5H17M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Clique para assinar digitalmente</span>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
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
    </div>
  );
};

export default Prescricoes;
