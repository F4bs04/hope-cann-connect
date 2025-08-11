import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, User, Check, ArrowLeft, ArrowRight, DollarSign } from 'lucide-react';
import { formatCurrency } from "@/utils/formatters";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PaymentStep } from '@/components/home-scheduling/PaymentStep';
import { createAppointmentScheduledNotification } from '@/services/notifications/notificationService';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  bio?: string;
  avatar?: string;
  isAvailable?: boolean;
  email?: string;
  consultationFee?: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface ConfirmationEmailData {
  appointment: any;
  doctor: Doctor;
  patient: any;
  scheduledDate: Date;
  scheduledTime: string;
}

// Função para enviar emails de confirmação
const sendConfirmationEmails = async (data: ConfirmationEmailData) => {
  try {
    console.log('=== ENVIANDO EMAILS DE CONFIRMAÇÃO ===');
    
    const { doctor, patient, scheduledDate, scheduledTime } = data;
    
    // Formatar data e horário para exibição
    const formattedDate = scheduledDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Link temporário do Google Meet
    const meetLink = 'https://meet.google.com/user';
    
    // Buscar dados completos do médico e paciente para o email
    const { data: doctorProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', doctor.id)
      .single();
      
    const { data: patientProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', patient.id)
      .single();
    
    console.log('Doctor Profile:', doctorProfile);
    console.log('Patient Profile:', patientProfile);
    
    // Preparar dados do email
    const emailData = {
      doctorName: doctorProfile?.full_name || doctor.name,
      doctorEmail: doctorProfile?.email,
      patientName: patientProfile?.full_name || patient.email,
      patientEmail: patientProfile?.email || patient.email,
      appointmentDate: formattedDate,
      appointmentTime: scheduledTime,
      meetLink: meetLink,
      specialty: doctor.specialty
    };
    
    console.log('Email data prepared:', emailData);
    
    // Enviar emails usando Supabase Edge Function
    console.log('Enviando emails via Supabase Edge Function...');
    
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-appointment-emails', {
      body: { emailData }
    });
    
    if (emailError) {
      console.error('Erro ao enviar emails:', emailError);
      // Não falhar o agendamento, apenas logar o erro
      console.log('Agendamento mantido mesmo com falha no email');
      return;
    }
    
    if (emailResult) {
      console.log('Resultado do envio de emails:', emailResult);
      
      if (emailResult.success) {
        console.log('✅ Emails enviados com sucesso!');
        console.log('📧 Email enviado para o médico:', emailData.doctorEmail);
        console.log('📧 Email enviado para o paciente:', emailData.patientEmail);
      } else {
        console.warn('⚠️ Falha no envio de emails:', emailResult.error);
      }
    }
    
    console.log('Processo de envio de emails concluído');
    
  } catch (error) {
    console.error('Erro ao enviar emails de confirmação:', error);
    // Não falhar o agendamento se o email falhar
    console.log('Agendamento mantido mesmo com falha no email');
  }
};

type Step = 'doctor' | 'datetime' | 'payment' | 'confirmation';

const SmartScheduling: React.FC = () => {
  const [step, setStep] = useState<Step>('doctor');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  
  // Debug logging for step changes
  console.log('=== SmartScheduling DEBUG ===');
  console.log('Current step:', step);
  console.log('Selected doctor:', selectedDoctor?.name);
  console.log('Selected date:', selectedDate);
  console.log('Selected time:', selectedTime);
  // Hook para buscar horários disponíveis
  // Usar o ID do profile do médico para buscar os horários configurados
  const { timeSlots, loading: slotsLoading, error: slotsError } = useAvailableTimeSlots(
    selectedDoctor?.id, // Este é o user_id do profile do médico
    selectedDate
  );
  
  console.log('=== DEBUG TIME SLOTS ===');
  console.log('Selected Doctor ID:', selectedDoctor?.id);
  console.log('Selected Date:', selectedDate);
  console.log('Time Slots:', timeSlots);
  console.log('Slots Loading:', slotsLoading);
  console.log('Slots Error:', slotsError);
  const [agendamentoSuccess, setAgendamentoSuccess] = useState(false);
  const [agendamentoError, setAgendamentoError] = useState<string | null>(null);

  // Buscar médicos disponíveis
  React.useEffect(() => {
    async function fetchDoctors() {
      setLoadingDoctors(true);
      console.log('=== BUSCANDO MÉDICOS DISPONÍVEIS ===');
      
      try {
        // Buscar médicos a partir da view pública para evitar problemas de RLS/joins
        const { data, error } = await supabase
          .from('public_doctors')
          .select(`
            doctor_id,
            doctor_name,
            specialty,
            consultation_fee,
            is_available,
            is_approved,
            avatar_url
          `)
          .eq('is_approved', true)
          .eq('is_available', true)
          .limit(10);
          
        if (error) {
          console.error('Erro ao buscar médicos:', error);
          toast.error('Erro ao carregar médicos');
          return;
        }
        
        if (data && data.length > 0) {
          console.log('Médicos encontrados:', data);
          const ids = data.map((d: any) => d.doctor_id).filter(Boolean);

          // Buscar detalhes adicionais (biografia) da tabela doctors com RLS pública
          let extrasMap: Record<string, { biography?: string }> = {};
          if (ids.length) {
            const { data: extras, error: extrasError } = await supabase
              .from('doctors')
              .select('id, biography')
              .in('id', ids)
              .eq('is_approved', true)
              .eq('is_suspended', false);
            if (extrasError) {
              console.warn('Não foi possível carregar detalhes extras do médico:', extrasError);
            } else if (extras) {
              extrasMap = Object.fromEntries(extras.map((e: any) => [e.id, { biography: e.biography }]));
            }
          }

          const formattedDoctors = data.map((d: any) => {
            const extra = extrasMap[d.doctor_id] || {};
            const bio = extra.biography || `Médico especialista em ${d.specialty || 'medicina geral'}`;
            return {
              id: d.doctor_id, // usar UUID do médico compatível com agendas/appointments
              name: d.doctor_name || 'Nome não informado',
              specialty: d.specialty || 'Clínico Geral',
              bio,
              email: '', // email pode não estar disponível nesta view
              phone: '',
              avatar: d.avatar_url || '/placeholder.svg',
              isAvailable: d.is_available && d.is_approved,
              consultationFee: d.consultation_fee || 0
            } as any;
          });
          
          console.log('Médicos formatados:', formattedDoctors);
          setDoctors(formattedDoctors);
        } else {
          console.log('Nenhum médico encontrado');
          setDoctors([]);
          toast.error('Nenhum médico disponível no momento');
        }
      } catch (err) {
        console.error('Erro ao buscar médicos:', err);
        toast.error('Erro ao carregar médicos');
      } finally {
        setLoadingDoctors(false);
      }
    }
    fetchDoctors();
  }, []);

  // This function is now removed since appointments are created in the Edge Function

  // Funções de navegação
  const handleNext = () => {
    console.log('=== HANDLE NEXT ===');
    console.log('Current step:', step);
    console.log('Selected doctor:', selectedDoctor?.name);
    console.log('Selected date:', selectedDate);
    console.log('Selected time:', selectedTime);
    
    if (step === 'doctor' && selectedDoctor) {
      console.log('Moving to datetime step');
      setStep('datetime');
    } else if (step === 'datetime' && selectedDate && selectedTime) {
      console.log('Moving to payment step');
      setStep('payment');
    } else if (step === 'payment') {
      console.log('Moving to confirmation step');
      setStep('confirmation');
    }
  };

  const handlePaymentSuccess = () => {
    console.log('=== PAYMENT SUCCESS ===');
    setStep('confirmation');
  };

  const handleBack = () => {
    if (step === 'datetime') {
      setStep('doctor');
    } else if (step === 'payment') {
      setStep('datetime');
    } else if (step === 'confirmation') {
      setStep('payment');
    }
  };

  // Gerar próximos 7 dias para seleção
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Agendar Consulta</h1>
        <p className="text-lg text-gray-600">
          Escolha um médico e horário para sua consulta
        </p>
      </div>

      {/* Indicador de Etapas */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step === 'doctor' ? 'bg-hopecann-teal text-white' : 
            step === 'datetime' || step === 'payment' || step === 'confirmation' ? 'bg-green-500 text-white' : 'bg-gray-200'
          }`}>
            <User size={20} />
          </div>
          <div className={`w-16 h-1 ${
            step === 'datetime' || step === 'payment' || step === 'confirmation' ? 'bg-green-500' : 'bg-gray-200'
          }`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step === 'datetime' ? 'bg-hopecann-teal text-white' : 
            step === 'payment' || step === 'confirmation' ? 'bg-green-500 text-white' : 'bg-gray-200'
          }`}>
            <Calendar size={20} />
          </div>
          <div className={`w-16 h-1 ${
            step === 'payment' || step === 'confirmation' ? 'bg-green-500' : 'bg-gray-200'
          }`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step === 'payment' ? 'bg-hopecann-teal text-white' : 
            step === 'confirmation' ? 'bg-green-500 text-white' : 'bg-gray-200'
          }`}>
            <DollarSign size={20} />
          </div>
          <div className={`w-16 h-1 ${
            step === 'confirmation' ? 'bg-green-500' : 'bg-gray-200'
          }`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step === 'confirmation' ? 'bg-hopecann-teal text-white' : 'bg-gray-200'
          }`}>
            <Check size={20} />
          </div>
        </div>
      </div>

      {agendamentoSuccess ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Consulta Agendada!</h3>
            <p className="text-gray-600 mb-4">
              Sua consulta foi agendada com sucesso. Você receberá uma confirmação em breve.
            </p>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Agendamento confirmado
            </Badge>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Etapa 1: Seleção do Médico */}
          {step === 'doctor' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <User className="text-hopecann-teal" />
                Escolha um Médico
              </h2>
              
              {loadingDoctors ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {doctors.map((doctor) => (
                    <Card 
                      key={doctor.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedDoctor?.id === doctor.id 
                          ? 'border-hopecann-teal bg-hopecann-teal/5 ring-2 ring-hopecann-teal/20' 
                          : 'border-gray-200 hover:border-hopecann-teal/50'
                      }`}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <CardContent className="p-6 relative">
                        {selectedDoctor?.id === doctor.id && (
                          <div className="absolute top-4 right-4 w-6 h-6 bg-hopecann-teal rounded-full flex items-center justify-center">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                        
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden ring-1 ring-hopecann-teal/20 bg-gray-100">
                              <img
                                src={doctor.avatar || '/placeholder.svg'}
                                alt={`Foto do médico ${doctor.name}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-semibold text-lg ${selectedDoctor?.id === doctor.id ? 'text-hopecann-teal' : 'text-gray-900'}`}>{doctor.name}</h3>
                              <p className="text-sm text-gray-600">{doctor.specialty}</p>
                              {doctor.bio && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {doctor.bio.length > 120 ? `${doctor.bio.slice(0, 120)}...` : doctor.bio}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-3">
                                <Badge variant="outline">Disponível</Badge>
                                <div className="flex items-center gap-1 text-hopecann-teal font-semibold">
                                  <DollarSign className="w-4 h-4" />
                                  <span>{formatCurrency(doctor.consultationFee || 0)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleNext}
                  disabled={!selectedDoctor}
                  className="bg-hopecann-teal hover:bg-hopecann-teal/90"
                >
                  Próximo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 2: Seleção de Data e Horário */}
          {step === 'datetime' && selectedDoctor && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Calendar className="text-hopecann-teal" />
                  Escolha Data e Horário
                </h2>
                <div className="text-sm text-gray-600">
                  Médico: <span className="font-medium">{selectedDoctor.name}</span>
                </div>
              </div>
              
              {/* Seleção de Data */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Selecione o dia:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {getNext7Days().map((date, index) => (
                    <Card 
                      key={index}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedDate?.toDateString() === date.toDateString()
                          ? 'border-hopecann-teal bg-hopecann-teal text-white'
                          : 'border-gray-200 hover:border-hopecann-teal/50 hover:bg-hopecann-teal/5'
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-sm font-medium">
                          {isToday(date) ? 'Hoje' : isTomorrow(date) ? 'Amanhã' : formatDate(date)}
                        </div>
                        <div className="text-xs mt-1 opacity-75">
                          {date.getDate()}/{date.getMonth() + 1}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Seleção de Horário */}
              {selectedDate && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Clock className="text-hopecann-teal" />
                    Horários disponíveis:
                  </h3>
                  
                  {slotsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hopecann-teal"></div>
                    </div>
                  ) : slotsError ? (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-600">
                        Erro ao carregar horários: {slotsError}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {timeSlots.filter(slot => slot.available).length === 0 ? (
                        <div className="col-span-full text-center py-8 text-gray-500">
                          Nenhum horário disponível para este dia.
                        </div>
                      ) : (
                        timeSlots
                          .filter(slot => slot.available)
                          .map((slot) => (
                            <Button
                              key={slot.time}
                              variant={selectedTime === slot.time ? "default" : "outline"}
                              className={`h-12 ${
                                selectedTime === slot.time 
                                  ? 'bg-hopecann-teal hover:bg-hopecann-teal/90' 
                                  : 'hover:border-hopecann-teal hover:text-hopecann-teal'
                              }`}
                              onClick={() => setSelectedTime(slot.time)}
                            >
                              {slot.time}
                            </Button>
                          ))
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!selectedDate || !selectedTime}
                  className="bg-hopecann-teal hover:bg-hopecann-teal/90"
                >
                  Próximo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 3: Pagamento */}
          {step === 'payment' && selectedDoctor && selectedDate && selectedTime && (
            <PaymentStep 
              selectedDoctorInfo={selectedDoctor}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onNext={handlePaymentSuccess}
              onBack={handleBack}
              appointmentData={{
                doctor_id: selectedDoctor.id,
                patient_id: null, // Will be set in the Edge Function
                scheduled_at: (() => {
                  const scheduledAt = new Date(selectedDate);
                  const [h, m] = selectedTime.split(':');
                  scheduledAt.setHours(Number(h), Number(m), 0, 0);
                  return scheduledAt.toISOString();
                })(),
                status: 'scheduled',
                consultation_type: 'in_person',
                reason: 'Consulta agendada via plataforma',
              }}
            />
          )}

          {/* Etapa 4: Confirmação - Pagamento processado com sucesso */}
          {step === 'confirmation' && selectedDoctor && selectedDate && selectedTime && (
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Consulta Agendada!</h3>
                <p className="text-gray-600 mb-4">
                  Sua consulta foi agendada e paga com sucesso. Você receberá uma confirmação em breve.
                </p>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div><strong>Médico:</strong> {selectedDoctor.name}</div>
                  <div><strong>Data:</strong> {selectedDate.toLocaleDateString('pt-BR')}</div>
                  <div><strong>Horário:</strong> {selectedTime}</div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Pagamento confirmado
                </Badge>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default SmartScheduling;