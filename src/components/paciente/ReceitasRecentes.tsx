
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Download, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { downloadDocument, getDocumentUrl } from '@/services/documentos/documentosService';

interface Receita {
  id: number;
  medicamento: string;
  data: string;
  status: string;
  posologia: string;
  observacoes?: string;
  arquivo_pdf?: string;
  data_validade?: string;
}

interface ReceitasRecentesProps {
  receitas: Receita[];
  isLoading?: boolean;
}

const ReceitasRecentes: React.FC<ReceitasRecentesProps> = ({ receitas, isLoading = false }) => {
  const { toast } = useToast();

  const handleDownloadPDF = async (receita: Receita) => {
    try {
      if (!receita.arquivo_pdf) {
        // Se não há PDF anexado, gerar PDF automaticamente do conteúdo
        await generateReceitaPDF(receita);
        return;
      }

      // Download do PDF anexado
      const success = await downloadDocument(
        receita.arquivo_pdf, 
        `receita_${receita.medicamento.replace(/\s+/g, '_')}_${receita.id}.pdf`
      );

      if (success) {
        toast({
          title: "Download concluído",
          description: "O PDF da receita foi baixado com sucesso.",
        });
      } else {
        throw new Error('Falha no download do arquivo');
      }
    } catch (error: any) {
      console.error('Erro ao baixar PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro no download",
        description: error.message || "Não foi possível baixar o PDF da receita.",
      });
    }
  };

  const generateReceitaPDF = async (receita: Receita) => {
    try {
      // Importar html2pdf dinamicamente
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Criar conteúdo HTML da receita
      const receitaHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">RECEITA MÉDICA</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Doc. Nº ${receita.id.toString().padStart(4, '0')}</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p style="margin: 10px 0;"><strong>Data de Emissão:</strong> ${format(new Date(receita.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            <p style="margin: 10px 0;"><strong>Validade:</strong> ${receita.data_validade ? format(new Date(receita.data_validade), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '30 dias'}</p>
          </div>
          
          <div style="margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <h3 style="color: #2563eb; margin-top: 0;">Medicamento Prescrito</h3>
            <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">${receita.medicamento}</p>
            <p style="margin: 10px 0;"><strong>Posologia:</strong> ${receita.posologia}</p>
            ${receita.observacoes ? `<p style="margin: 10px 0;"><strong>Observações:</strong> ${receita.observacoes}</p>` : ''}
          </div>
          
          <div style="margin-top: 60px; text-align: center; border-top: 1px solid #000; padding-top: 20px;">
            <div style="width: 300px; margin: 0 auto;">
              <p style="font-weight: bold; margin: 0;">Assinatura e Carimbo do Médico</p>
              <p style="margin: 10px 0 0 0; font-size: 14px;">CRM: 12345 - RJ</p>
            </div>
          </div>
        </div>
      `;
      
      // Criar elemento temporário
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = receitaHTML;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      
      // Configurações do PDF
      const options = {
        margin: 1,
        filename: `receita_${receita.medicamento.replace(/\s+/g, '_')}_${receita.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      // Gerar e baixar PDF
      await html2pdf().set(options).from(tempDiv).save();
      
      // Limpar elemento temporário
      document.body.removeChild(tempDiv);
      
      toast({
        title: "PDF gerado",
        description: "A receita foi gerada e baixada como PDF.",
      });
      
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro na geração do PDF",
        description: "Não foi possível gerar o PDF da receita.",
      });
    }
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
                  onClick={() => handleDownloadPDF(receita)}
                  className="flex-shrink-0 ml-3"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {receita.arquivo_pdf ? 'Baixar PDF' : 'Gerar PDF'}
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
