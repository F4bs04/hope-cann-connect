
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ open, onOpenChange, userId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { userData } = useAuth();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [biografia, setBiografia] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  useEffect(() => {
    // Carregar dados do estado caso já exista
    if (userData) {
      setNome(userData.nome || "");
      setTelefone(userData.telefone || "");
      setEspecialidade(userData.especialidade || "");
      setBiografia(userData.biografia || "");
      setFoto(userData.foto_perfil || null);
      return;
    }
    
    // Ou buscar dados da API se não tiver no estado
    const fetchData = async () => {
      if (!userId) return;
      const { data, error } = await supabase.from("medicos").select("*").eq("id_usuario", userId).maybeSingle();
      if (data) {
        setNome(data.nome || "");
        setTelefone(data.telefone || "");
        setEspecialidade(data.especialidade || "");
        setBiografia(data.biografia || "");
        setFoto(data.foto_perfil || null);
      }
    };
    
    if (open) fetchData();
  }, [userId, open, userData]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFotoFile(files[0]);
      setFoto(URL.createObjectURL(files[0]));
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fotoUrl = foto;
      if (fotoFile) {
        const fileExt = fotoFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `medicos/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, fotoFile);

        if (uploadError) {
          throw new Error("Erro ao enviar a foto: " + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);
        fotoUrl = publicUrl;
      }

      // Atualiza dados no Supabase
      const { error } = await supabase.from("medicos").update({
        nome,
        telefone,
        especialidade,
        biografia,
        foto_perfil: fotoUrl
      }).eq("id_usuario", userId);

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
        description: "As informações do seu perfil foram salvas com sucesso."
      });
      onOpenChange(false);
    } catch (er: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: er.message || "Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar meu perfil</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-4 pt-2">
          <div>
            {foto ? (
              <img src={foto} alt="Foto de perfil" className="w-24 h-24 object-cover rounded-full mb-2 mx-auto" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-2 mx-auto">
                <span className="text-gray-400">Sem foto</span>
              </div>
            )}
            <label className="block w-full text-center">
              <span className="text-sm text-hopecann-teal">Alterar foto de perfil</span>
              <Input type="file" accept="image/*" className="mt-1" onChange={handleFotoChange} />
            </label>
          </div>
          <Input 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome completo"
            required
          />
          <Input 
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Telefone"
            required
          />
          <Input 
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
            placeholder="Especialidade"
            required
          />
          <textarea 
            className="w-full min-h-[80px] rounded-md px-2 py-2 border"
            value={biografia}
            onChange={(e) => setBiografia(e.target.value)}
            placeholder="Breve biografia"
          />
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="w-full">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
};

export default EditProfileDialog;
