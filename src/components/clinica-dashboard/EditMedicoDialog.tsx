
import React, { useRef } from 'react';
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
import { User, Camera } from "lucide-react";

interface EditMedicoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medico: MedicoInfo | null;
  onUpdate: () => void;
}

interface MedicoInfo {
  id: string;
  nome: string;
  crm: string;
  especialidade: string;
  biografia: string;
  telefone: string;
  valor_por_consulta: number;
  status: string;
  aprovado: boolean;
  foto_perfil?: string | null;
  data_aprovacao?: string | null;
}

export function EditMedicoDialog({ open, onOpenChange, medico, onUpdate }: EditMedicoDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<Omit<MedicoInfo, 'id' | 'status'>>>({});
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (medico) {
      const { id, status, ...medicoData } = medico;
      setFormData(medicoData);
    }
  }, [medico]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !medico) return;

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${medico.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualizar o profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', medico.id);

      if (updateError) throw updateError;

      setFormData({ ...formData, foto_perfil: publicUrl });
      
      toast({
        title: "Foto atualizada",
        description: "A foto de perfil foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Não foi possível atualizar a foto de perfil.",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medico) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('doctors')
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
            {/* Foto de Perfil */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Foto</Label>
              <div className="col-span-3 flex items-center gap-4">
                <div className="relative">
                  {formData.foto_perfil ? (
                    <img
                      src={formData.foto_perfil}
                      alt={formData.nome}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-6 w-6 p-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <span className="text-sm text-muted-foreground">
                  {uploadingPhoto ? "Carregando..." : "Clique no ícone para alterar"}
                </span>
              </div>
            </div>
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
