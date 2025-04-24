
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';

interface Receita {
  id: number;
  medicamento: string;
  data: string;
  status: string;
  posologia: string;
}

interface ReceitasRecentesProps {
  receitas: Receita[];
  isLoading?: boolean;
}

const ReceitasRecentes: React.FC<ReceitasRecentesProps> = ({ receitas, isLoading = false }) => {
  const handleDownloadPDF = (receitaId: number) => {
    // Implement PDF download logic here
    console.log('Download PDF for receita:', receitaId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Receitas Recentes</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-hopecann-teal" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Receitas Recentes</CardTitle>
        <Button variant="link" onClick={() => window.location.href = '#receitas'}>
          Ver todas
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {receitas.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhuma receita encontrada
            </div>
          ) : (
            receitas.map((receita) => (
              <div
                key={receita.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-hopecann-teal mt-1" />
                  <div>
                    <h4 className="font-medium">{receita.medicamento}</h4>
                    <p className="text-sm text-gray-600">
                      Emitida em: {format(new Date(receita.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPDF(receita.id)}
                >
                  Baixar PDF
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceitasRecentes;
