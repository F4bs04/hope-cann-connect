
import React from 'react';
import { format, parseISO } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Mensagem {
  id: number;
  paciente: string;
  mensagem: string;
  data: string;
  lida: boolean;
}

interface MensagensTableProps {
  mensagens: Mensagem[];
  setSelectedMensagem: (mensagem: Mensagem) => void;
  setMensagemDialogOpen: (open: boolean) => void;
}

const MensagensTable: React.FC<MensagensTableProps> = ({
  mensagens,
  setSelectedMensagem,
  setMensagemDialogOpen
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paciente</TableHead>
          <TableHead>Mensagem</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mensagens.map(mensagem => (
          <TableRow key={mensagem.id}>
            <TableCell className="font-medium">{mensagem.paciente}</TableCell>
            <TableCell className="truncate max-w-[300px]">{mensagem.mensagem}</TableCell>
            <TableCell>{format(parseISO(mensagem.data), 'dd/MM/yyyy')}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${mensagem.lida ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {mensagem.lida ? 'Respondida' : 'Não lida'}
              </span>
            </TableCell>
            <TableCell>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedMensagem(mensagem);
                  setMensagemDialogOpen(true);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Responder
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MensagensTable;
