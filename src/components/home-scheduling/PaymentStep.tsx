import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Lock, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PaymentStepProps {
  selectedDoctorInfo: any;
  selectedDate: Date | null;
  selectedTime: string | null;
  onNext: () => void;
  onBack: () => void;
  appointmentData: any;
}

interface CardData {
  number: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  selectedDoctorInfo,
  selectedDate,
  selectedTime,
  onNext,
  onBack,
  appointmentData
}) => {
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    holderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<CardData>>({});

  const consultationFee = selectedDoctorInfo?.consultationFee || 150;

  // Máscara para número do cartão (4 grupos de 4 dígitos)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Validações básicas
  const validateForm = () => {
    const newErrors: Partial<CardData> = {};
    
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 16) {
      newErrors.number = 'Número do cartão inválido';
    }
    
    if (!cardData.holderName || cardData.holderName.length < 3) {
      newErrors.holderName = 'Nome do portador é obrigatório';
    }
    
    if (!cardData.expiryMonth || !cardData.expiryYear) {
      newErrors.expiryMonth = 'Data de validade inválida';
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CardData, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    } else if (field === 'expiryMonth') {
      formattedValue = value.replace(/\D/g, '').substring(0, 2);
    } else if (field === 'expiryYear') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }
    
    setCardData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Limpar erro do campo quando usuário digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      console.log('Processando pagamento...');
      
      // Preparar dados para a API da Pagar.me
      const paymentData = {
        amount: Math.round(consultationFee * 100), // Converter para centavos
        cardData: {
          number: cardData.number.replace(/\s/g, ''),
          holder_name: cardData.holderName,
          exp_month: cardData.expiryMonth,
          exp_year: cardData.expiryYear,
          cvv: cardData.cvv
        },
        appointmentData,
        description: `Consulta com ${selectedDoctorInfo?.name || 'Médico'}`
      };
      
      console.log('Dados do pagamento:', paymentData);
      
      // Chamar Edge Function para processar pagamento
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: paymentData
      });
      
      if (error) {
        console.error('Erro na Edge Function:', error);
        throw new Error('Erro ao processar pagamento');
      }
      
      if (data.success) {
        toast.success('Pagamento aprovado! Agendando consulta...');
        console.log('Pagamento aprovado:', data);
        onNext(); // Avançar para confirmação
      } else {
        throw new Error(data.error || 'Pagamento recusado');
      }
      
    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Pagamento</h2>
        <p className="text-muted-foreground">
          Finalize o pagamento para confirmar sua consulta
        </p>
      </div>

      {/* Resumo da Consulta */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CreditCard className="h-5 w-5" />
            Resumo da Consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Médico:</span>
            <span className="font-medium">{selectedDoctorInfo?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Especialidade:</span>
            <span className="font-medium">{selectedDoctorInfo?.specialty}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Data:</span>
            <span className="font-medium">
              {selectedDate ? formatDate(selectedDate) : 'Não selecionada'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Horário:</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <Badge variant="default" className="text-lg px-3 py-1">
              {formatCurrency(consultationFee)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-600" />
            Dados do Cartão de Crédito
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Seus dados estão protegidos com criptografia SSL
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Número do Cartão */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              maxLength={19}
              className={errors.number ? 'border-red-500' : ''}
            />
            {errors.number && (
              <p className="text-sm text-red-500">{errors.number}</p>
            )}
          </div>

          {/* Nome no Cartão */}
          <div className="space-y-2">
            <Label htmlFor="holderName">Nome no Cartão</Label>
            <Input
              id="holderName"
              placeholder="NOME COMO ESTÁ NO CARTÃO"
              value={cardData.holderName}
              onChange={(e) => handleInputChange('holderName', e.target.value.toUpperCase())}
              className={errors.holderName ? 'border-red-500' : ''}
            />
            {errors.holderName && (
              <p className="text-sm text-red-500">{errors.holderName}</p>
            )}
          </div>

          {/* Validade e CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Mês</Label>
              <Input
                id="expiryMonth"
                placeholder="MM"
                value={cardData.expiryMonth}
                onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                maxLength={2}
                className={errors.expiryMonth ? 'border-red-500' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryYear">Ano</Label>
              <Input
                id="expiryYear"
                placeholder="AAAA"
                value={cardData.expiryYear}
                onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                maxLength={4}
                className={errors.expiryYear ? 'border-red-500' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                maxLength={4}
                className={errors.cvv ? 'border-red-500' : ''}
              />
            </div>
          </div>
          {(errors.expiryMonth || errors.cvv) && (
            <p className="text-sm text-red-500">
              {errors.expiryMonth || errors.cvv}
            </p>
          )}

          {/* Cartões de Teste (apenas em desenvolvimento) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Cartões de Teste</h4>
            <p className="text-sm text-blue-700 mb-2">
              Use estes cartões para testar o pagamento:
            </p>
            <div className="space-y-1 text-sm text-blue-700">
              <p><strong>Aprovado:</strong> 4111 1111 1111 1111</p>
              <p><strong>Recusado:</strong> 4000 0000 0000 0002</p>
              <p><strong>Qualquer CVV:</strong> 123 | <strong>Validade:</strong> 12/2025</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <Button 
          onClick={handlePayment} 
          disabled={isProcessing}
          className="min-w-[200px]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Pagar {formatCurrency(consultationFee)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};