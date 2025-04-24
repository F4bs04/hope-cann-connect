
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditMedicoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medico: MedicoInfo | null;
  onUpdate: () => void;
}

interface MedicoInfo {
  id: number;
  nome: string;
  crm: string;
  especialidade: string;
  status: string;
  aprovado: boolean;
  foto_perfil?: string | null;
  data_aprovacao?: string | null;
  biografia: string;
  telefone: string;
  valor_por_consulta: number;
}

export function EditMedicoDialog({ open, onOpenChange, medico, onUpdate }: EditMedicoDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<MedicoInfo>>({});

  React.useEffect(() => {
    if (medico) {
      setFormData({
        nome: medico.nome,
        crm: medico.crm,
        especialidade: medico.especialidade,
        biografia: medico.biografia,
        telefone: medico.telefone,
        valor_por_consulta: medico.valor_por_consulta
      });
    }
  }, [medico]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medico) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('medicos')
        .update(formData)
        .eq('id', medico.id);

      if (error) throw error;

      toast({
        title: "Médico atualizado",
        description: "As informações do médico foram atualizadas com sucesso.",
      });
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar médico:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar médico",
        description: "Ocorreu um erro ao tentar atualizar as informações.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Médico</DialogTitle>
          <DialogDescription>
            Atualize as informações do médico. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">Nome</Label>
              <Input
                id="nome"
                value={formData.nome || ''}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="crm" className="text-right">CRM</Label>
              <Input
                id="crm"
                value={formData.crm || ''}
                onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="especialidade" className="text-right">Especialidade</Label>
              <Input
                id="especialidade"
                value={formData.especialidade || ''}
                onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="biografia" className="text-right">Biografia</Label>
              <Input
                id="biografia"
                value={formData.biografia || ''}
                onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefone" className="text-right">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone || ''}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valor" className="text-right">Valor Consulta</Label>
              <Input
                id="valor"
                type="number"
                value={formData.valor_por_consulta || ''}
                onChange={(e) => setFormData({ ...formData, valor_por_consulta: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
