import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, User, ArrowRight, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PatientMergeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicate: any;
  onConfirm: (sourceId: string, targetId: string) => Promise<void>;
}

export const PatientMergeDialog: React.FC<PatientMergeDialogProps> = ({
  open,
  onOpenChange,
  duplicate,
  onConfirm,
}) => {
  const [candidatePatients, setCandidatePatients] = useState<any[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);

  useEffect(() => {
    if (open && duplicate) {
      loadPatientDetails();
      findCandidatePatients();
    }
  }, [open, duplicate]);

  const loadPatientDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', duplicate.patient_id)
        .single();

      if (error) throw error;
      setPatientData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do paciente:', error);
    }
  };

  const findCandidatePatients = async () => {
    setIsLoading(true);
    try {
      // Simplified search - just search by CPF for now
      if (duplicate.cpf) {
        const { data } = await supabase
          .from('patients')
          .select('*')
          .neq('id', duplicate.patient_id)
          .eq('cpf', duplicate.cpf);
        
        setCandidatePatients(data || []);
      } else {
        setCandidatePatients([]);
      }
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedTarget || !patientData) return;
    
    await onConfirm(patientData.id, selectedTarget);
  };

  const getMatchScore = (candidate: any) => {
    let score = 0;
    if (candidate.cpf === duplicate.cpf) score += 40;
    if (candidate.email === duplicate.email) score += 30;
    if (candidate.full_name?.toLowerCase() === duplicate.full_name?.toLowerCase()) score += 20;
    if (candidate.birth_date === duplicate.birth_date) score += 10;
    return score;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Confirmar Merge de Pacientes
          </DialogTitle>
          <DialogDescription>
            Selecione o paciente de destino para mesclar os dados. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Paciente Origem */}
          <Card className="border-warning">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Paciente a ser Mesclado (Origem)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientData && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Nome:</strong> {patientData.full_name}</p>
                    <p><strong>CPF:</strong> {patientData.cpf || 'Não informado'}</p>
                  </div>
                  <div>
                    <p><strong>Email:</strong> {patientData.email || 'Não informado'}</p>
                    <p><strong>Data Nasc:</strong> {patientData.birth_date ? new Date(patientData.birth_date).toLocaleDateString() : 'Não informado'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* Candidatos para Merge */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Selecione o Paciente de Destino:</h3>
            
            {isLoading ? (
              <div className="text-center py-4">Carregando candidatos...</div>
            ) : candidatePatients.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum candidato encontrado para merge automático.
              </div>
            ) : (
              <RadioGroup value={selectedTarget} onValueChange={setSelectedTarget}>
                <div className="space-y-3">
                  {candidatePatients.map((candidate) => {
                    const matchScore = getMatchScore(candidate);
                    return (
                      <div key={candidate.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={candidate.id} id={candidate.id} />
                        <Label htmlFor={candidate.id} className="flex-1">
                          <Card className="cursor-pointer hover:bg-muted/50">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{candidate.full_name}</h4>
                                <Badge variant={matchScore >= 70 ? "destructive" : matchScore >= 40 ? "secondary" : "outline"}>
                                  {matchScore}% match
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                <div>
                                  <p>CPF: {candidate.cpf || 'Não informado'}</p>
                                  <p>Email: {candidate.email || 'Não informado'}</p>
                                </div>
                                <div>
                                  <p>Data Nasc: {candidate.birth_date ? new Date(candidate.birth_date).toLocaleDateString() : 'Não informado'}</p>
                                  <p>Criado: {new Date(candidate.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            )}
          </div>

          <Separator />

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              <h4 className="font-semibold">O que será transferido:</h4>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Todos os documentos médicos (receitas, atestados, laudos)</li>
              <li>• Histórico de consultas e prontuários</li>
              <li>• Relacionamentos com médicos</li>
              <li>• Mensagens de chat</li>
              <li>• O paciente origem será marcado como "mesclado"</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedTarget}
            className="bg-warning hover:bg-warning/90"
          >
            Confirmar Merge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};