
import React from 'react';
import { format, parseISO } from 'date-fns';
import { FileText, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Paciente {
  id: number;
  nome: string;
  idade: number;
  condicao: string;
  ultimaConsulta: string;
}

interface PacientesTableProps {
  pacientes: Paciente[];
  setSelectedPaciente: (paciente: Paciente) => void;
  setProntuarioDialogOpen: (open: boolean) => void;
  setReceitaDialogOpen: (open: boolean) => void;
}

const PacientesTable: React.FC<PacientesTableProps> = ({
  pacientes,
  setSelectedPaciente,
  setProntuarioDialogOpen,
  setReceitaDialogOpen
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Idade</TableHead>
          <TableHead>Condição</TableHead>
          <TableHead>Última Consulta</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pacientes.map(paciente => (
          <TableRow key={paciente.id}>
            <TableCell className="font-medium">{paciente.nome}</TableCell>
            <TableCell>{paciente.idade} anos</TableCell>
            <TableCell>{paciente.condicao}</TableCell>
            <TableCell>{format(parseISO(paciente.ultimaConsulta), 'dd/MM/yyyy')}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedPaciente(paciente);
                    setProntuarioDialogOpen(true);
                  }}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Prontuário
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedPaciente(paciente);
                    setReceitaDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Receita
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PacientesTable;
