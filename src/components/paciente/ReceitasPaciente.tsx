import React, { useEffect } from 'react';
import { usePatientDocuments } from '@/hooks/usePatientDocuments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, Clock } from 'lucide-react';
import { downloadDocument, getDocumentUrl } from '@/services/documentos/documentosService';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

const ReceitasPaciente: React.FC = () => {
  const { prescriptions, isLoading, error, fetchPrescriptions } = usePatientDocuments();

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleDownloadPDF = async (receita: any) => {
    try {
      // Verificar se existe arquivo PDF já salvo
      if (receita.file_path) {
        const success = await downloadDocument(receita.file_path, `receita-${receita.medication_name}.pdf`);
        if (success) {
          toast.success('Receita baixada com sucesso!');
          return;
        }
      }

      // Se não existir PDF, gerar um novo
      await generateReceitaPDF(receita);
    } catch (error) {
      console.error('Erro ao baixar receita:', error);
      toast.error('Erro ao baixar receita');
    }
  };

  const generateReceitaPDF = async (receita: any) => {
    try {
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">RECEITA MÉDICA</h1>
            <p style="color: #666; margin: 0;">Prescrição Digital</p>
          </div>
          
          <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">Informações da Receita</h2>
            <div style="margin-bottom: 10px;"><strong>Medicamento:</strong> ${receita.medication_name}</div>
            <div style="margin-bottom: 10px;"><strong>Dosagem:</strong> ${receita.dosage}</div>
            <div style="margin-bottom: 10px;"><strong>Frequência:</strong> ${receita.frequency}</div>
            <div style="margin-bottom: 10px;"><strong>Duração:</strong> ${receita.duration}</div>
            ${receita.instructions ? `<div style="margin-bottom: 10px;"><strong>Instruções:</strong> ${receita.instructions}</div>` : ''}
            ${receita.notes ? `<div style="margin-bottom: 10px;"><strong>Observações:</strong> ${receita.notes}</div>` : ''}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="text-align: center; color: #666; font-size: 12px;">
              Receita emitida em: ${new Date(receita.issued_at).toLocaleDateString('pt-BR')}<br>
              Documento gerado digitalmente
            </p>
          </div>
        </div>
      `;

      document.body.appendChild(element);

      const opt = {
        margin: 1,
        filename: `receita-${receita.medication_name}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      document.body.removeChild(element);
      
      toast.success('PDF da receita gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF da receita');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-destructive text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Erro ao carregar receitas</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhuma receita encontrada</p>
            <p className="text-sm mt-2">Suas receitas médicas aparecerão aqui quando forem emitidas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Minhas Receitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {prescriptions.map((receita) => (
              <Card key={receita.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{receita.medication_name}</h3>
                        <Badge variant="secondary">Receita</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Dosagem:</span>
                          <span className="text-muted-foreground">{receita.dosage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Frequência:</span>
                          <span className="text-muted-foreground">{receita.frequency}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Duração:</span>
                          <span className="text-muted-foreground">{receita.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-muted-foreground">
                            {new Date(receita.issued_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {receita.instructions && (
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <p className="text-sm">
                            <span className="font-medium">Instruções:</span> {receita.instructions}
                          </p>
                        </div>
                      )}

                      {receita.notes && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm">
                            <span className="font-medium">Observações:</span> {receita.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <Button
                        onClick={() => handleDownloadPDF(receita)}
                        size="sm"
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        {receita.file_path ? 'Baixar PDF' : 'Gerar PDF'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceitasPaciente;