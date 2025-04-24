
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

interface Documento {
  id: number;
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
      // Fetch documents from your database
      // This is a placeholder for the actual implementation
      const { data } = await supabase
        .from('documentos')
        .select(`
          id,
          tipo,
          nome,
          data_criacao,
          medicos (nome),
          pacientes (nome)
        `)
        .order('data_criacao', { ascending: false });
      
      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          tipo: item.tipo,
          nome: item.nome,
          data: item.data_criacao,
          medico: item.medicos?.nome || 'N/A',
          paciente: item.pacientes?.nome || 'N/A'
        }));
        setDocumentos(formattedData);
      }
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
