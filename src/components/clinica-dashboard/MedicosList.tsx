import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Shield, 
  Award, 
  Trash,
  UserMinus,
  AlertCircle,
  Pencil,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { EditMedicoDialog } from './EditMedicoDialog';

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

export const MedicosList = () => {
  const [medicos, setMedicos] = React.useState<MedicoInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [medicoParaRemover, setMedicoParaRemover] = useState<MedicoInfo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [medicoParaEditar, setMedicoParaEditar] = useState<MedicoInfo | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();
  
  React.useEffect(() => {
    fetchMedicos();
  }, []);

  const fetchMedicos = async () => {
    setIsLoading(true);
    try {
      const { data: doctors, error } = await supabase
        .from('doctors')
        .select(`
          id,
          crm,
          specialty,
          biography,
          consultation_fee,
          is_available,
          is_approved,
          approved_at,
          cpf,
          profiles!inner(full_name, email, phone, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar médicos:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar médicos",
          description: "Não foi possível carregar a lista de médicos.",
        });
        return;
      }

      const medicosFormatados: MedicoInfo[] = (doctors || []).map(doctor => ({
        id: doctor.id,
        nome: doctor.profiles?.full_name || 'Nome não informado',
        crm: doctor.crm,
        especialidade: doctor.specialty,
        biografia: doctor.biography || 'Biografia não informada',
        telefone: doctor.profiles?.phone || 'Telefone não informado',
        valor_por_consulta: Number(doctor.consultation_fee) || 0,
        status: doctor.is_approved ? 'Aprovado' : 'Pendente',
        aprovado: doctor.is_approved,
        foto_perfil: doctor.profiles?.avatar_url,
        data_aprovacao: doctor.approved_at
      }));

      setMedicos(medicosFormatados);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar os médicos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoverMedico = (medico: MedicoInfo) => {
    setMedicoParaRemover(medico);
    setDialogOpen(true);
  };

  const confirmarRemocao = async () => {
    if (!medicoParaRemover) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ 
          is_available: false,
          is_approved: false
        })
        .eq('id', medicoParaRemover.id);

      if (error) {
        console.error('Erro ao remover médico:', error);
        toast({
          variant: "destructive",
          title: "Erro ao remover médico",
          description: "Não foi possível remover o médico. Tente novamente.",
        });
        return;
      }

      toast({
        title: "Médico suspenso",
        description: `${medicoParaRemover.nome} foi suspenso com sucesso.`,
      });
      
      // Recarregar lista
      await fetchMedicos();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao remover o médico.",
      });
    } finally {
      setDialogOpen(false);
      setMedicoParaRemover(null);
      setIsLoading(false);
    }
  };

  const handleEditarMedico = (medico: MedicoInfo) => {
    setMedicoParaEditar(medico);
    setEditDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Médicos Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <p>Carregando médicos...</p>
            </div>
          ) : medicos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum médico cadastrado</h3>
              <p className="text-muted-foreground mt-2">
                Quando houver médicos cadastrados na clínica, eles aparecerão aqui.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Médico</TableHead>
                  <TableHead>CRM</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credenciais</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicos.map((medico) => (
                  <TableRow key={medico.id}>
                    <TableCell className="flex items-center gap-2">
                      {medico.foto_perfil ? (
                        <img 
                          src={medico.foto_perfil} 
                          alt={medico.nome} 
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 p-1 rounded-full bg-gray-100" />
                      )}
                      {medico.nome}
                    </TableCell>
                    <TableCell>{medico.crm}</TableCell>
                    <TableCell>{medico.especialidade}</TableCell>
                    <TableCell>
                      <Badge className={medico.aprovado ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}>
                        {medico.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <Award className="h-4 w-4 text-blue-500" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEditarMedico(medico)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoverMedico(medico)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirmar suspensão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja suspender o médico <strong>{medicoParaRemover?.nome}</strong>?
              <br /><br />
              O médico será suspenso e não poderá acessar o sistema até ser reativado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmarRemocao} 
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? "Suspendendo..." : "Sim, suspender médico"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditMedicoDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        medico={medicoParaEditar}
        onUpdate={fetchMedicos}
      />
    </>
  );
};