
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveTemplateExame } from '@/services/exames/examesService';
import { useToast } from '@/hooks/use-toast';

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    nomeExame: string;
    justificativa: string;
    prioridade: string;
    instrucoes: string;
  };
  medicoId: number | null;
  onSuccess: () => void;
}

const SaveTemplateDialog: React.FC<SaveTemplateDialogProps> = ({
  open,
  onOpenChange,
  formData,
  medicoId,
  onSuccess
}) => {
  const [nome, setNome] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const handleSave = async () => {
    if (!nome.trim()) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "Por favor, dê um nome para este template",
      });
      return;
    }
    
    if (!medicoId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "ID do médico não encontrado",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const templateData = {
        id_medico: medicoId,
        nome: nome,
        nome_exame: formData.nomeExame,
        justificativa: formData.justificativa,
        prioridade: formData.prioridade,
        instrucoes: formData.instrucoes
      };
      
      console.log('Enviando dados do template:', templateData);
      await saveTemplateExame(templateData);
      
      toast({
        title: "Template salvo",
        description: "O template foi salvo com sucesso",
      });
      
      onSuccess();
      onOpenChange(false);
      setNome(''); // Reset the name field
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar o template",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) setNome(''); // Reset name when dialog closes
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Salvar Template</DialogTitle>
          <DialogDescription>
            Salve este formulário como um template para uso futuro.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template-name" className="text-right">
              Nome
            </Label>
            <Input
              id="template-name"
              placeholder="Ex: Hemograma Completo"
              className="col-span-3"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-gray-500">
              Exame
            </Label>
            <div className="col-span-3">
              <p className="text-sm">{formData.nomeExame}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            setNome('');
            onOpenChange(false);
          }}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveTemplateDialog;
