
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';

const Laudos: React.FC = () => {
  const [tipoLaudo, setTipoLaudo] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [conclusao, setConclusao] = useState('');
  const [cid, setCid] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [assinado, setAssinado] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the laudo submission
    console.log({
      tipoLaudo,
      objetivo,
      descricao,
      conclusao,
      cid,
      observacoes,
      assinado
    });
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Emissão de Laudo Médico</h1>
        <p className="text-gray-600">
          Preencha todos os campos obrigatórios para gerar o laudo
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="objetivo" className="font-medium">
                Objetivo do Laudo*
              </Label>
              <Input
                id="objetivo"
                placeholder="Descreva o objetivo do laudo"
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="descricao" className="font-medium">
                Descrição Clínica Detalhada*
              </Label>
              <Textarea
                id="descricao"
                placeholder="Inclua todos os detalhes clínicos relevantes"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="mt-1 min-h-[150px]"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="conclusao" className="font-medium">
                Conclusão Médica*
              </Label>
              <Textarea
                id="conclusao"
                placeholder="Digite a conclusão médica"
                value={conclusao}
                onChange={(e) => setConclusao(e.target.value)}
                className="mt-1 min-h-[100px]"
                required
              />
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
            
            <div className="flex justify-between pt-4">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 flex-1 mr-2"
                disabled={!assinado}
              >
                Gerar Laudo
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 ml-2"
              >
                Exportar PDF
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
