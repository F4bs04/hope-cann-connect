import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { History, ArrowRight, User, Calendar } from 'lucide-react';
import { usePatientDeduplication } from '@/hooks/usePatientDeduplication';

export const PatientMergeHistory: React.FC = () => {
  const { getMergeHistory } = usePatientDeduplication();
  const [mergeHistory, setMergeHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMergeHistory();
  }, []);

  const loadMergeHistory = async () => {
    setIsLoading(true);
    try {
      const history = await getMergeHistory();
      setMergeHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'CPF_EXACT': return 'CPF Idêntico';
      case 'EMAIL_EXACT': return 'Email Idêntico';
      case 'NAME_DOB_SIMILAR': return 'Nome + Data Similar';
      case 'MANUAL': return 'Merge Manual';
      default: return reason;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'destructive';
    if (score >= 0.7) return 'secondary';
    return 'outline';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p>Carregando histórico...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mergeHistory.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <History className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum Merge Realizado</h3>
          <p className="text-muted-foreground text-center">
            Ainda não foram realizadas operações de merge de pacientes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5" />
        <h3 className="text-xl font-semibold">Histórico de Merges</h3>
        <Badge variant="outline">{mergeHistory.length} operações</Badge>
      </div>

      <div className="space-y-4">
        {mergeHistory.map((merge) => (
          <Card key={merge.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Merge de Pacientes
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={getConfidenceColor(merge.confidence_score)}>
                    {Math.round(merge.confidence_score * 100)}% confiança
                  </Badge>
                  <Badge variant="outline">
                    {getReasonLabel(merge.merge_reason)}
                  </Badge>
                </div>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(merge.performed_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center flex-1">
                  <h4 className="font-semibold mb-1">Paciente Origem</h4>
                  <p className="text-sm text-muted-foreground">
                    {merge.source_patient?.full_name || 'Nome não disponível'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {merge.source_patient_id}
                  </p>
                </div>
                
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                
                <div className="text-center flex-1">
                  <h4 className="font-semibold mb-1">Paciente Destino</h4>
                  <p className="text-sm text-muted-foreground">
                    {merge.target_patient?.full_name || 'Nome não disponível'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {merge.target_patient_id}
                  </p>
                </div>
              </div>

              {merge.data_moved && (
                <>
                  <Separator className="my-4" />
                  <div className="text-sm">
                    <h5 className="font-semibold mb-2">Dados Transferidos:</h5>
                    <div className="grid grid-cols-2 gap-4 text-muted-foreground">
                      <div>
                        <p>Documentos: {merge.data_moved.documents_moved || 0}</p>
                        <p>Consultas: {merge.data_moved.appointments_moved || 0}</p>
                      </div>
                      <div>
                        <p>Prontuários: {merge.data_moved.medical_records_moved || 0}</p>
                        <p>Relacionamentos: {merge.data_moved.doctor_relationships_moved || 0}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};