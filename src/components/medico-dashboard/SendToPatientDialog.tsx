import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createDocumentNotification } from '@/services/notifications/notificationService';

interface Patient {
  id: string;
  full_name: string;
  user_id: string;
}

interface SendToPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescriptionData: any;
  prescriptionId: string;
}

export function SendToPatientDialog({ 
  open, 
  onOpenChange, 
  prescriptionData, 
  prescriptionId 
}: SendToPatientDialogProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPatients();
    }
  }, [open]);

  const loadPatients = async () => {
    setLoadingPatients(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar pacientes que tiveram consultas com este médico
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          patients!inner(
            id,
            full_name,
            user_id
          )
        `)
        .eq('doctor_id', user.id)
        .not('patients.user_id', 'is', null);

      if (error) throw error;

      // Extrair pacientes únicos
      const uniquePatients = appointments?.reduce((acc: Patient[], appointment: any) => {
        const patient = appointment.patients;
        if (patient && !acc.find(p => p.id === patient.id)) {
          acc.push(patient);
        }
        return acc;
      }, []) || [];

      setPatients(uniquePatients);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de pacientes",
        variant: "destructive",
      });
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleSendToPatient = async () => {
    if (!selectedPatientId || !prescriptionId) return;

    setLoading(true);
    try {
      const selectedPatient = patients.find(p => p.id === selectedPatientId);
      if (!selectedPatient) return;

      // Criar notificação para o paciente
      const result = await createDocumentNotification(
        selectedPatient.user_id,
        prescriptionData.doctor_name || 'Médico',
        'receita',
        prescriptionId
      );

      if (result.success) {
        toast({
          title: "Sucesso",
          description: `Receita enviada para ${selectedPatient.full_name}`,
        });

        onOpenChange(false);
        setSelectedPatientId('');
        setMessage('');
      } else {
        throw new Error(result.error || 'Erro ao enviar receita');
      }
    } catch (error: any) {
      console.error('Erro ao enviar receita:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar receita para o paciente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Receita ao Paciente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Selecionar Paciente*</Label>
            <Select 
              value={selectedPatientId} 
              onValueChange={setSelectedPatientId}
              disabled={loadingPatients}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={loadingPatients ? "Carregando..." : "Selecione um paciente"} />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      {patient.full_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Apenas pacientes que agendaram consultas com você
            </p>
          </div>

          <div>
            <Label>Mensagem (opcional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Adicione uma mensagem personalizada..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendToPatient}
              disabled={!selectedPatientId || loading}
            >
              {loading ? "Enviando..." : "Enviar Receita"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}