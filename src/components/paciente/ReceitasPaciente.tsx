
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Clock, Download, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Receita {
  id: number;
  medicamento: string;
  posologia: string;
  data: Date;
  data_validade: Date;
  status: 'ativa' | 'expirada' | 'cancelada';
  observacoes?: string;
  medico: {
    id: number;
    nome: string;
    especialidade: string;
  };
}

const ReceitasPaciente: React.FC = () => {
  const { toast } = useToast();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dados mockados - em um aplicativo real, viriam do banco de dados
  useEffect(() => {
    setTimeout(() => {
      setReceitas([
        {
          id: 1,
          medicamento: 'Óleo de CBD 100mg/ml',
          posologia: '1 gota sublingual, 2x ao dia',
          data: new Date(2025, 3, 15),
          data_validade: new Date(2025, 9, 15),
          status: 'ativa',
          observacoes: 'Em caso de efeitos colaterais, reduzir para 1x ao dia.',
          medico: {
            id: 2,
            nome: 'Dr. Ricardo Silva',
            especialidade: 'Neurologia',
          }
        },
        {
          id: 2,
          medicamento: 'Extrato de Cannabis 50mg/ml (THC:CBD 1:20)',
          posologia: '0,5ml via oral após o jantar',
          data: new Date(2025, 2, 10),
          data_validade: new Date(2025, 8, 10),
          status: 'ativa',
          medico: {
            id: 3,
            nome: 'Dra. Amanda Oliveira',
            especialidade: 'Clínica Geral',
          }
        },
        {
          id: 3,
          medicamento: 'Óleo de CBD 50mg/ml',
          posologia: '2 gotas sublingual, 3x ao dia',
          data: new Date(2024, 11, 5),
          data_validade: new Date(2025, 2, 5),
          status: 'expirada',
          medico: {
            id: 2,
            nome: 'Dr. Ricardo Silva',
            especialidade: 'Neurologia',
          }
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDownloadReceita = (id: number) => {
    // Em um aplicativo real, isso geraria e baixaria um PDF
    toast({
      title: "Download iniciado",
      description: "O download da sua receita começará em instantes.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativa':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'expirada':
        return <Badge className="bg-amber-100 text-amber-800">Expirada</Badge>;
      case 'cancelada':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Suas Receitas</h2>
      
      {receitas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma receita encontrada</h3>
            <p className="text-gray-500 mb-4">
              Você ainda não possui receitas registradas em nosso sistema.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {receitas.map(receita => (
            <Card key={receita.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{receita.medicamento}</CardTitle>
                  {getStatusBadge(receita.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    Posologia: {receita.posologia}
                  </p>
                  
                  {receita.observacoes && (
                    <p className="text-sm text-gray-600">
                      Observações: {receita.observacoes}
                    </p>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    <span>{receita.medico.nome} - {receita.medico.especialidade}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      <span>Emitida em: {format(new Date(receita.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Válida até: {format(new Date(receita.data_validade), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleDownloadReceita(receita.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Receita
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceitasPaciente;
