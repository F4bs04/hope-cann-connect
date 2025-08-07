import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Users, Merge, Search, History, CheckCircle } from 'lucide-react';
import { usePatientDeduplication } from '@/hooks/usePatientDeduplication';
import { PatientMergeDialog } from './PatientMergeDialog';
import { PatientMergeHistory } from './PatientMergeHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const PatientDuplicatesManager: React.FC = () => {
  const {
    duplicates,
    isLoading,
    detectDuplicates,
    mergePatients
  } = usePatientDeduplication();
  
  const [selectedDuplicate, setSelectedDuplicate] = useState<any>(null);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    detectDuplicates();
  }, [detectDuplicates]);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'bg-destructive';
    if (score >= 0.7) return 'bg-warning';
    return 'bg-secondary';
  };

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'CPF_EXACT': return 'CPF Idêntico';
      case 'EMAIL_EXACT': return 'Email Idêntico';
      case 'NAME_DOB_SIMILAR': return 'Nome + Data Similar';
      default: return type;
    }
  };

  const handleMergeRequest = (duplicate: any) => {
    setSelectedDuplicate(duplicate);
    setShowMergeDialog(true);
  };

  const handleMergeConfirm = async (sourceId: string, targetId: string) => {
    if (!selectedDuplicate) return;
    
    const success = await mergePatients({
      sourcePatientId: sourceId,
      targetPatientId: targetId,
      reason: selectedDuplicate.match_type,
      confidenceScore: selectedDuplicate.confidence_score
    });
    
    if (success) {
      setShowMergeDialog(false);
      setSelectedDuplicate(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Gestão de Duplicatas de Pacientes</h2>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={detectDuplicates}
            disabled={isLoading}
            variant="outline"
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Detectando...' : 'Detectar Duplicatas'}
          </Button>
          <Button
            onClick={() => setShowHistory(true)}
            variant="outline"
          >
            <History className="h-4 w-4 mr-2" />
            Histórico
          </Button>
        </div>
      </div>

      <Tabs defaultValue="duplicates" className="w-full">
        <TabsList>
          <TabsTrigger value="duplicates">
            Duplicatas Detectadas
            {duplicates.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {duplicates.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved">Resolvidas</TabsTrigger>
        </TabsList>

        <TabsContent value="duplicates" className="space-y-4">
          {duplicates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma Duplicata Encontrada</h3>
                <p className="text-muted-foreground text-center">
                  Todos os pacientes estão únicos no sistema.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {duplicates.map((duplicate, index) => (
                <Card key={index} className="border-warning">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        <CardTitle className="text-lg">Possível Duplicata</CardTitle>
                        <Badge className={getConfidenceColor(duplicate.confidence_score)}>
                          {Math.round(duplicate.confidence_score * 100)}% confiança
                        </Badge>
                      </div>
                      <Button
                        onClick={() => handleMergeRequest(duplicate)}
                        size="sm"
                        className="gap-2"
                      >
                        <Merge className="h-4 w-4" />
                        Mesclar
                      </Button>
                    </div>
                    <CardDescription>
                      Critério: {getMatchTypeLabel(duplicate.match_type)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Dados do Paciente</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Nome:</strong> {duplicate.full_name}</p>
                          <p><strong>CPF:</strong> {duplicate.cpf || 'Não informado'}</p>
                          <p><strong>Email:</strong> {duplicate.email || 'Não informado'}</p>
                          <p><strong>Data Nasc:</strong> {duplicate.birth_date ? new Date(duplicate.birth_date).toLocaleDateString() : 'Não informado'}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Ações Recomendadas</h4>
                        <div className="text-sm text-muted-foreground">
                          <p>• Verificar dados dos pacientes</p>
                          <p>• Confirmar se são a mesma pessoa</p>
                          <p>• Mesclar dados se confirmado</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved">
          <PatientMergeHistory />
        </TabsContent>
      </Tabs>

      {selectedDuplicate && (
        <PatientMergeDialog
          open={showMergeDialog}
          onOpenChange={setShowMergeDialog}
          duplicate={selectedDuplicate}
          onConfirm={handleMergeConfirm}
        />
      )}
    </div>
  );
};