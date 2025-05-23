
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Paciente {
  id: number;
  nome: string;
  idade: number;
  condicao: string;
  ultimaConsulta: string;
}

interface ReceitaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPaciente: Paciente | null;
}

const ReceitaDialog: React.FC<ReceitaDialogProps> = ({
  open,
  onOpenChange,
  selectedPaciente
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Receita</DialogTitle>
          {selectedPaciente && (
            <DialogDescription>
              Paciente: {selectedPaciente.nome}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="medicamento" className="text-sm font-medium">
              Medicamento
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o medicamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cbd-5">Óleo CBD 5%</SelectItem>
                <SelectItem value="cbd-3">Óleo CBD 3%</SelectItem>
                <SelectItem value="cbd-thc-20-1">Óleo CBD:THC 20:1</SelectItem>
                <SelectItem value="cbd-thc-10-1">Óleo CBD:THC 10:1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="posologia" className="text-sm font-medium">
              Posologia
            </label>
            <Textarea 
              id="posologia" 
              placeholder="Ex: 10 gotas, 2x ao dia" 
              className="mt-1" 
            />
          </div>
          <div>
            <label htmlFor="observacoes" className="text-sm font-medium">
              Observações
            </label>
            <Textarea 
              id="observacoes" 
              placeholder="Observações adicionais" 
              className="mt-1" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button>Emitir receita</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceitaDialog;
