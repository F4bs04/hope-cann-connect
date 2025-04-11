
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Receita {
  id: number;
  paciente: string;
  medicamento: string;
  posologia: string;
  data: string;
}

interface ReceitasTableProps {
  receitas: Receita[];
}

const ReceitasTable: React.FC<ReceitasTableProps> = ({
  receitas
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paciente</TableHead>
          <TableHead>Medicamento</TableHead>
          <TableHead>Posologia</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {receitas.map(receita => (
          <TableRow key={receita.id}>
            <TableCell className="font-medium">{receita.paciente}</TableCell>
            <TableCell>{receita.medicamento}</TableCell>
            <TableCell>{receita.posologia}</TableCell>
            <TableCell>{format(parseISO(receita.data), 'dd/MM/yyyy')}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ReceitasTable;
