
import React from 'react';
import { format, parseISO } from 'date-fns';
import { FileText, Edit, ClipboardList } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const handleOpenProntuario = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setProntuarioDialogOpen(true);
  };

  const handleOpenReceita = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setReceitaDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lista de Pacientes</h2>
      </div>
      
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
              <TableCell>
                <Badge variant="outline" className="bg-blue-50">
                  {paciente.condicao}
                </Badge>
              </TableCell>
              <TableCell>{format(parseISO(paciente.ultimaConsulta), 'dd/MM/yyyy')}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenProntuario(paciente)}
                  >
                    <ClipboardList className="h-4 w-4 mr-1" />
                    Prontuário
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenReceita(paciente)}
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
    </div>
  );
};

export default PacientesTable;
