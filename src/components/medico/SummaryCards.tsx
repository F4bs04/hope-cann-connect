
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Clock, MessageSquare, FileText, X, Eye, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Consulta {
  id: number;
  paciente: string;
  data: string;
  horario: string;
  status: string;
}

interface Mensagem {
  id: number;
  paciente: string;
  mensagem: string;
  data: string;
  lida: boolean;
}

interface Receita {
  id: number;
  paciente: string;
  medicamento: string;
  posologia: string;
  data: string;
}

interface SummaryCardsProps {
  consultas: Consulta[];
  mensagens: Mensagem[];
  receitasMock: Receita[];
  handleCancelarConsulta: (consultaId: number) => void;
  setSelectedMensagem: (mensagem: Mensagem) => void;
  setMensagemDialogOpen: (open: boolean) => void;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  consultas,
  mensagens,
  receitasMock,
  handleCancelarConsulta,
  setSelectedMensagem,
  setMensagemDialogOpen
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-hopecann-teal" />
            Próximas consultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {consultas.filter(c => c.status === 'agendada').slice(0, 3).map(consulta => (
              <div key={consulta.id} className="flex justify-between items-center p-2 text-sm border-b">
                <div>
                  <p className="font-medium">{consulta.paciente}</p>
                  <p className="text-xs text-gray-500">{format(parseISO(consulta.data), 'dd/MM/yyyy')} - {consulta.horario}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleCancelarConsulta(consulta.id)}
                  title="Cancelar consulta"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="link" className="w-full mt-2" onClick={() => navigate('/agenda')}>
            Ver todas as consultas
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-hopecann-green" />
            Mensagens recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mensagens.filter(m => !m.lida).slice(0, 3).map(mensagem => (
              <div key={mensagem.id} className="flex justify-between items-center p-2 text-sm border-b">
                <div>
                  <p className="font-medium">{mensagem.paciente}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{mensagem.mensagem}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedMensagem(mensagem);
                    setMensagemDialogOpen(true);
                  }}
                  title="Ver mensagem"
                >
                  <Eye className="h-4 w-4 text-blue-500" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="link" className="w-full mt-2" onClick={() => navigate('/mensagens')}>
            Ver todas as mensagens
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-hopecann-blue" />
            Receitas recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {receitasMock.slice(0, 3).map(receita => (
              <div key={receita.id} className="flex justify-between items-center p-2 text-sm border-b">
                <div>
                  <p className="font-medium">{receita.paciente}</p>
                  <p className="text-xs text-gray-500">{receita.medicamento}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  title="Editar receita"
                >
                  <Edit className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="link" className="w-full mt-2" onClick={() => navigate('/receitas')}>
            Ver todas as receitas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
