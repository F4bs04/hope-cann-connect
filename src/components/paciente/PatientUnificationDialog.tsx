import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePatientDeduplication } from '@/hooks/usePatientDeduplication';
import { useAuth } from '@/hooks/useUnifiedAuth';
import { AlertCircle, User, FileText } from 'lucide-react';

interface PatientUnificationDialogProps {
  open: boolean;
  onClose: () => void;
}

const PatientUnificationDialog: React.FC<PatientUnificationDialogProps> = ({ open, onClose }) => {
  const { duplicates, detectDuplicates, mergePatients, isLoading, isMerging } = usePatientDeduplication();
  const { userProfile } = useAuth();
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);

  useEffect(() => {
    if (open && userProfile) {
      detectDuplicates(userProfile);
    }
  }, [open, userProfile, detectDuplicates]);

  const handleUnifyPatient = async (patientId: string) => {
    const success = await mergePatients({
      sourcePatientId: patientId,
      targetPatientId: userProfile?.id || '',
      reason: 'Patient record unification',
      confidenceScore: 0.9
    });

    if (success) {
      // Refresh the duplicates list
      detectDuplicates(userProfile);
    }
  };

  if (!userProfile) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Unificação de Registros de Paciente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Buscando registros...</p>
            </div>
          ) : duplicates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Nenhum registro adicional encontrado para unificar.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">
                      Registros de Paciente Encontrados
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Encontramos {duplicates.length} registro(s) que podem ser seus. 
                      Ao unificar, você terá acesso a todos os documentos médicos associados.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {duplicates.map((duplicate) => (
                  <Card key={duplicate.patient_id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {duplicate.full_name || 'Nome não informado'}
                        </CardTitle>
                        <Badge variant={duplicate.match_type === 'email' ? 'default' : 'secondary'}>
                          {duplicate.match_type === 'email' ? 'Match por Email' : 'Match por Nome'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">CPF/Email:</span> {duplicate.cpf}
                        </div>
                        <div>
                          <span className="font-medium">Data de Nascimento:</span> {duplicate.birth_date || 'Não informado'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-sm text-muted-foreground">
                          Confiança: {Math.round(duplicate.confidence_score * 100)}%
                        </div>
                        <Button
                          onClick={() => handleUnifyPatient(duplicate.patient_id)}
                          disabled={isMerging}
                          size="sm"
                        >
                          {isMerging ? 'Unificando...' : 'Unificar Registro'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientUnificationDialog;