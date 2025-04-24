
import React from 'react';
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
import { User, Shield, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MedicoInfo {
  id: number;
  nome: string;
  crm: string;
  especialidade: string;
  status: string;
  aprovado: boolean;
  foto_perfil?: string | null;
  data_aprovacao?: string | null;
}

export const MedicosList = () => {
  const [medicos, setMedicos] = React.useState<MedicoInfo[]>([]);
  
  React.useEffect(() => {
    const fetchMedicos = async () => {
      const { data } = await supabase
        .from('medicos')
        .select('*')
        .order('nome', { ascending: true });
      
      if (data) setMedicos(data);
    };
    
    fetchMedicos();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Médicos Cadastrados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Médico</TableHead>
              <TableHead>CRM</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Credenciais</TableHead>
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
                  <Badge variant={medico.aprovado ? "success" : "warning"}>
                    {medico.aprovado ? "Aprovado" : "Pendente"}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <Award className="h-4 w-4 text-blue-500" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
