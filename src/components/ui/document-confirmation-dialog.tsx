import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, FileText, User, Calendar, AlertCircle } from 'lucide-react';

interface DocumentConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  documentData: {
    paciente: {
      full_name?: string;
      nome?: string;
    };
    medicamento: string;
    posologia: string;
    observacoes?: string;
    tipoReceita?: string;
    tempoUso?: string;
    periodo?: string;
  };
  documentType: 'receita' | 'atestado' | 'laudo';
  isGenerating?: boolean;
}

const DocumentConfirmationDialog: React.FC<DocumentConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  documentData,
  documentType,
  isGenerating = false
}) => {
  const getDocumentTitle = () => {
    switch (documentType) {
      case 'receita': return 'Receita Médica';
      case 'atestado': return 'Atestado Médico';
      case 'laudo': return 'Laudo Médico';
      default: return 'Documento Médico';
    }
  };

  const patientName = documentData.paciente?.full_name || documentData.paciente?.nome || 'Nome não informado';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Confirmar {getDocumentTitle()}
          </DialogTitle>
          <DialogDescription>
            Revise os dados do documento antes de finalizar. Após a confirmação, o documento será gerado e uma notificação será enviada ao paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Paciente:</span>
                  <span>{patientName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Data de emissão:</span>
                  <span>{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Detalhes do Documento:</h4>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-sm">Medicamento:</span>
                  <p className="text-sm text-gray-700 ml-4">{documentData.medicamento}</p>
                </div>
                
                <div>
                  <span className="font-medium text-sm">Posologia:</span>
                  <p className="text-sm text-gray-700 ml-4">{documentData.posologia}</p>
                </div>
                
                {documentData.tempoUso && documentData.periodo && (
                  <div>
                    <span className="font-medium text-sm">Tempo de uso:</span>
                    <p className="text-sm text-gray-700 ml-4">{documentData.tempoUso} {documentData.periodo}</p>
                  </div>
                )}
                
                {documentData.tipoReceita && (
                  <div>
                    <span className="font-medium text-sm">Tipo de receita:</span>
                    <p className="text-sm text-gray-700 ml-4 capitalize">{documentData.tipoReceita}</p>
                  </div>
                )}
                
                {documentData.observacoes && (
                  <div>
                    <span className="font-medium text-sm">Observações:</span>
                    <p className="text-sm text-gray-700 ml-4">{documentData.observacoes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Atenção:</p>
              <p>Ao confirmar, o documento será finalizado e não poderá ser editado. Uma notificação será enviada ao paciente e o PDF será gerado automaticamente.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isGenerating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Gerando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirmar e Finalizar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentConfirmationDialog;