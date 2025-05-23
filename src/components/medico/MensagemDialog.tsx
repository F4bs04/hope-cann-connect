
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Mensagem {
  id: number;
  paciente: string;
  mensagem: string;
  data: string;
  lida: boolean;
}

interface MensagemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMensagem: Mensagem | null;
  onResponder: () => void;
}

const MensagemDialog: React.FC<MensagemDialogProps> = ({
  open,
  onOpenChange,
  selectedMensagem,
  onResponder
}) => {
  const [resposta, setResposta] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Responder mensagem</DialogTitle>
          {selectedMensagem && (
            <DialogDescription>
              De: {selectedMensagem.paciente} - {format(parseISO(selectedMensagem.data), 'dd/MM/yyyy')}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-4">
          {selectedMensagem && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm">{selectedMensagem.mensagem}</p>
            </div>
          )}
          <div>
            <label htmlFor="resposta" className="text-sm font-medium">
              Sua resposta
            </label>
            <Textarea 
              id="resposta" 
              placeholder="Digite sua resposta aqui..." 
              className="mt-1" 
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onResponder}>Enviar resposta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MensagemDialog;
