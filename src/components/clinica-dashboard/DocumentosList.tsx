
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
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface Documento {
  id: string;
  tipo: string;
  nome: string;
  data: string;
  medico: string;
  paciente: string;
}

export const DocumentosList = () => {
  const [documentos, setDocumentos] = React.useState<Documento[]>([]);
  
  React.useEffect(() => {
    const fetchDocumentos = async () => {
      // Dados simulados para documentos
      const documentosSimulados: Documento[] = [
        {
          id: '1',
          tipo: 'Prescrição',
          nome: 'Prescrição Cannabis - João Silva',
          data: new Date().toISOString(),
          medico: 'Dr. Carlos Silva',
          paciente: 'João Silva'
        },
        {
          id: '2',
          tipo: 'Atestado',
          nome: 'Atestado Médico - Maria Santos',
          data: new Date().toISOString(),
          medico: 'Dra. Ana Mendes',
          paciente: 'Maria Santos'
        }
      ];
      setDocumentos(documentosSimulados);
    };
    
    fetchDocumentos();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentos.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.tipo}</TableCell>
                <TableCell>{doc.nome}</TableCell>
                <TableCell>
                  {format(new Date(doc.data), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>{doc.medico}</TableCell>
                <TableCell>{doc.paciente}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
