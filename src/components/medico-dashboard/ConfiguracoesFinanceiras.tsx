import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  TrendingUp, 
  Calculator,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ConfiguracoesFinanceiras = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [consultationFee, setConsultationFee] = useState(150);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorData, setDoctorData] = useState<any>(null);

  // Valores pré-definidos em múltiplos de R$50
  const feeOptions = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600];

  useEffect(() => {
    loadDoctorData();
  }, [userProfile]);

  const loadDoctorData = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, consultation_fee, crm, specialty')
        .eq('user_id', userProfile.id)
        .single();

      if (error) {
        console.error('Error loading doctor data:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do médico.",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setDoctorData(data);
        setConsultationFee(data.consultation_fee || 150);
      }
    } catch (error) {
      console.error('Error in loadDoctorData:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConsultationFee = async () => {
    if (!doctorData) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ consultation_fee: consultationFee })
        .eq('id', doctorData.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Configurações salvas!",
        description: `Valor da consulta atualizado para R$ ${consultationFee.toFixed(2)}`,
        variant: "default"
      });

      // Atualizar dados locais
      setDoctorData({ ...doctorData, consultation_fee: consultationFee });
    } catch (error) {
      console.error('Error saving consultation fee:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações financeiras.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateMonthlyEstimate = () => {
    // Estimativa baseada em 20 consultas por mês (média)
    const averageConsultationsPerMonth = 20;
    return consultationFee * averageConsultationsPerMonth;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hopecann-teal"></div>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            Dados do médico não encontrados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <DollarSign className="h-8 w-8 text-hopecann-teal" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações Financeiras</h1>
          <p className="text-gray-600">Defina o valor das suas consultas</p>
        </div>
      </div>

      {/* Current Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Valor da Consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Fee Display */}
          <div className="text-center p-6 bg-hopecann-teal/5 rounded-lg border border-hopecann-teal/20">
            <div className="text-3xl font-bold text-hopecann-teal mb-2">
              R$ {consultationFee.toFixed(2)}
            </div>
            <p className="text-gray-600">Valor atual por consulta</p>
          </div>

          {/* Fee Selection */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Selecione o novo valor (múltiplos de R$ 50,00):
            </Label>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {feeOptions.map((fee) => (
                <button
                  key={fee}
                  onClick={() => setConsultationFee(fee)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    consultationFee === fee
                      ? 'border-hopecann-teal bg-hopecann-teal text-white'
                      : 'border-gray-200 hover:border-hopecann-teal'
                  }`}
                >
                  <div className="font-semibold">R$ {fee}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Earnings */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium">Estimativa Mensal</span>
            </div>
            <p className="text-gray-600 text-sm mb-2">
              Baseado em 20 consultas por mês:
            </p>
            <div className="text-2xl font-bold text-green-600">
              R$ {calculateMonthlyEstimate().toFixed(2)}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={saveConsultationFee}
              disabled={saving || consultationFee === doctorData.consultation_fee}
              className="min-w-32"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>

          {/* Success Message */}
          {consultationFee === doctorData.consultation_fee && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Configurações salvas</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">Info</Badge>
            <div>
              <p className="font-medium mb-1">Valores Padronizados</p>
              <p className="text-sm text-gray-600">
                Os valores são definidos em múltiplos de R$ 50,00 para facilitar o gerenciamento financeiro.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">Dica</Badge>
            <div>
              <p className="font-medium mb-1">Definição de Preços</p>
              <p className="text-sm text-gray-600">
                Considere sua especialização, experiência e região para definir o valor adequado das consultas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">Nota</Badge>
            <div>
              <p className="font-medium mb-1">Aplicação Imediata</p>
              <p className="text-sm text-gray-600">
                As alterações serão aplicadas imediatamente para novos agendamentos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracoesFinanceiras;
