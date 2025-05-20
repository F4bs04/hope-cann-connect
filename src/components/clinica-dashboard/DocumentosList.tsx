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
      // Check the actual database schema
      const { data, error } = await supabase
        .from('documentos')
        .select(`
          id,
          tipo,
          descricao,
          data_upload,
          id_usuario_upload,
          id_paciente,
          caminho_arquivo
        `)
        .order('data_upload', { ascending: false });
      
      if (error) {
        console.error("Error fetching documents:", error);
        return;
      }
      
      if (data) {
        // Use mock data for now, but structured from actual database records
        const formattedData = data.map((item, index) => ({
          id: item.id,
          tipo: item.tipo || 'Prescrição',
          nome: item.descricao || `Documento ${index + 1}`,
          data: item.data_upload || new Date().toISOString(),
          medico: `Dr. ${index % 2 === 0 ? 'Carlos Silva' : 'Ana Mendes'}`,
          paciente: `Paciente ${index + 1}`
        }));
        setDocumentos(formattedData);
      }
    };
    
    fetchDocumentos();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
          <FileText className="h-5 w-5" />
          Documentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
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
        </div>
      </CardContent>
    </Card>
  );
};
