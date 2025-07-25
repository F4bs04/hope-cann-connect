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
      // Usar dados simulados por enquanto
      const medicosSimulados: MedicoInfo[] = [
        {
          id: '1',
          nome: 'Dr. João Silva',
          crm: '123456-SP',
          especialidade: 'Neurologia',
          biografia: 'Especialista em neurologia com 15 anos de experiência',
          telefone: '(11) 99999-9999',
          valor_por_consulta: 300,
          status: 'Aprovado',
          aprovado: true,
          foto_perfil: '/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png',
          data_aprovacao: new Date().toISOString()
        },
        {
          id: '2',
          nome: 'Dra. Maria Santos',
          crm: '789012-RJ',
          especialidade: 'Psiquiatria',
          biografia: 'Especialista em psiquiatria',
          telefone: '(21) 88888-8888',
          valor_por_consulta: 250,
          status: 'Pendente',
          aprovado: false,
          foto_perfil: '/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png',
          data_aprovacao: null
        }
      ];
      setMedicos(medicosSimulados);
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
      // Simular remoção
      toast({
        title: "Médico removido",
        description: `${medicoParaRemover.nome} foi removido da clínica com sucesso.`,
        variant: "default"
      });
      
      setMedicos(medicos.filter(m => m.id !== medicoParaRemover.id));
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
              Confirmar remoção
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o médico <strong>{medicoParaRemover?.nome}</strong> da clínica?
              <br /><br />
              Esta ação não poderá ser desfeita e o médico perderá acesso ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmarRemocao} 
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? "Removendo..." : "Sim, remover médico"}
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