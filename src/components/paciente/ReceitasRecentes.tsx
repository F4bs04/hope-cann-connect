
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
          <Skeleton className="h-10 w-20" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
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
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Nenhuma receita encontrada</p>
              <p className="text-sm">Suas receitas aparecerão aqui após as consultas.</p>
            </div>
          ) : (
            receitas.map((receita) => (
              <div
                key={receita.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-hopecann-teal mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 truncate">{receita.medicamento}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Emitida em: {format(new Date(receita.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    {receita.status && (
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                        receita.status === 'ativa' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {receita.status}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPDF(receita.id)}
                  className="flex-shrink-0 ml-3"
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
