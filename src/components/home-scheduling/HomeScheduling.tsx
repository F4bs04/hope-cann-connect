import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { StepIndicator } from './StepIndicator';
import { DoctorStep } from './DoctorStep';
import { DateTimeStep } from './DateTimeStep';
import { UserDataStep } from './UserDataStep';
import { ConfirmationStep } from './ConfirmationStep';
import { fetchDoctors } from './utils/doctorUtils'; // This utility is specific to fetching the list
import { formatTelefone } from '@/utils/formatters';
import { supabase } from "@/integrations/supabase/client";
import { createConsulta } from '@/services/consultas/consultasService';
import { useConsultationData } from '@/hooks/useConsultationData'; // Import the hook

const HomeScheduling = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use state and functions from the hook
  const {
    step,
    setStep,
    selectedDoctor,
    setSelectedDoctor, // This is handleDoctorSelection from the hook
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedConsultType,
    // setSelectedConsultType, // Not actively changed in this flow
    formData,
    setFormData, // Raw setter from the hook
    doctorInfo, // This replaces selectedDoctorInfo
    handleBack, // Use handleBack from the hook
  } = useConsultationData();

  // State managed locally in HomeScheduling
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For fetching doctors list
  const [dbStatus, setDbStatus] = useState({
    success: true,
    message: ''
  });
  
  // Load doctors list on mount - remains specific to this component
  useEffect(() => {
    fetchDoctors({ setDoctors, setIsLoading, setDbStatus, toast });
  }, [toast]); // Removed setFormData from deps as it's stable
  
  // Custom form handling for HomeScheduling (includes phone formatting)
  const localHandleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'phone') {
      formattedValue = formatTelefone(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };
  
  // Custom navigation functions for HomeScheduling (includes validation)
  const localHandleNext = () => {
    if (step === 1 && !selectedDoctor) {
      toast({
        title: "Seleção pendente",
        description: "Por favor, selecione um médico para continuar.",
        variant: "default",
      });
      return;
    }
    if (step === 2 && (!selectedDate || !selectedTime)) {
      toast({
        title: "Seleção pendente",
        description: "Por favor, selecione data e horário para continuar.",
        variant: "default",
      });
      return;
    }
    setStep(prev => prev + 1); // Use setStep from hook
  };
  
  // handleSubmit remains largely the same but uses state/setters from the hook
  const localHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[HomeScheduling] Iniciando handleSubmit com dados do formulário:", JSON.stringify(formData, null, 2));
    console.log("[HomeScheduling] Estado da consulta antes do submit:", { selectedDoctor, selectedDate, selectedTime, selectedConsultType });
    
    const { data: { session } } = await supabase.auth.getSession();
    console.log("[HomeScheduling] Sessão do usuário obtida:", session ? session.user?.email : 'Nenhuma sessão ativa');

    if (session && session.user) {
      console.log("[HomeScheduling] Usuário logado. Email:", session.user.email);
      try {
        const { data: usuarioData, error: usuarioError } = await supabase
          .from('usuarios')
          .select('id, tipo_usuario')
          .eq('email', session.user.email)
          .single();

        console.log("[HomeScheduling] Dados do usuário (tabela usuarios) buscados:", usuarioData, "Erro ao buscar usuário:", usuarioError);

        if (usuarioError || !usuarioData) {
          toast({ title: "Erro de Usuário", description: "Não foi possível verificar seus dados de usuário.", variant: "destructive" });
          console.error("[HomeScheduling] Erro ao buscar dados do usuário ou usuário não encontrado. Erro:", usuarioError);
          return;
        }

        if (usuarioData.tipo_usuario !== 'paciente') {
          toast({ title: "Ação não permitida", description: "Apenas pacientes podem agendar consultas através desta interface.", variant: "destructive" });
          console.warn("[HomeScheduling] Tentativa de agendamento por usuário não paciente. Tipo:", usuarioData.tipo_usuario);
          return;
        }
        
        console.log("[HomeScheduling] Buscando ID do paciente para id_usuario:", usuarioData.id);
        const { data: pacienteData, error: pacienteError } = await supabase
          .from('pacientes')
          .select('id')
          .eq('id_usuario', usuarioData.id)
          .single();

        console.log("[HomeScheduling] Dados do paciente (tabela pacientes) buscados:", pacienteData, "Erro ao buscar paciente:", pacienteError);

        if (pacienteError || !pacienteData) {
          toast({ title: "Perfil de Paciente Incompleto", description: "Não encontramos seu perfil de paciente. Por favor, complete seu cadastro ou entre em contato com o suporte.", variant: "destructive" });
          console.error("[HomeScheduling] Erro ao buscar perfil do paciente ou perfil não encontrado para id_usuario:", usuarioData.id, "Erro:", pacienteError);
          return;
        }

        const pacienteId = pacienteData.id;
        console.log("[HomeScheduling] ID do Paciente confirmado:", pacienteId);

        if (!selectedDoctor || !selectedDate || !selectedTime) {
          toast({ title: "Dados Incompletos", description: "Médico, data ou horário não selecionados.", variant: "destructive" });
          console.warn("[HomeScheduling] Tentativa de submissão com dados incompletos:", { selectedDoctor, selectedDate, selectedTime });
          return;
        }
        
        const dataHora = new Date(selectedDate);
        const [hours, minutes] = selectedTime.split(':').map(Number);
        dataHora.setHours(hours, minutes, 0, 0);
        const dataHoraISO = dataHora.toISOString();
        console.log("[HomeScheduling] Data e Hora da consulta formatada para ISO:", dataHoraISO);

        const consultaParaSalvar = {
          id_medico: selectedDoctor,
          id_paciente: pacienteId,
          data_hora: dataHoraISO,
          status: 'agendada', 
          tipo_consulta: selectedConsultType,
          motivo: formData.symptoms,
        };
        console.log("[HomeScheduling] Objeto final consultaParaSalvar antes de enviar para createConsulta:", JSON.stringify(consultaParaSalvar, null, 2));

        const { data: createdConsulta, error: createConsultaError } = await createConsulta(consultaParaSalvar);
        console.log("[HomeScheduling] Resultado de createConsulta recebido:", { createdConsulta, createConsultaError });

        if (createdConsulta && !createConsultaError) {
          toast({ title: "Agendamento Concluído!", description: "Sua consulta foi agendada com sucesso." });
          setStep(4); 
        } else {
           console.error("[HomeScheduling] Falha ao criar consulta. Erro retornado por createConsulta:", JSON.stringify(createConsultaError, null, 2));
           toast({ title: "Erro no Agendamento", description: createConsultaError?.message || "Não foi possível agendar sua consulta. Verifique os logs.", variant: "destructive" });
        }
      } catch (error: any) {
        console.error("[HomeScheduling] Erro geral (catch) ao agendar consulta (usuário logado):", error);
        toast({ title: "Erro no Agendamento", description: error.message || "Ocorreu um erro ao tentar agendar sua consulta.", variant: "destructive" });
      }
    } else { 
      console.log("[HomeScheduling] Usuário não logado. Redirecionando para login.");
      toast({
        title: "Login Necessário",
        description: "Você será redirecionado para fazer login ou criar uma conta para confirmar seu agendamento.",
      });
      
      const schedulingAttempt = {
        selectedDoctor,
        selectedDate: selectedDate?.toISOString(), 
        selectedTime,
        selectedConsultType,
        formData,
        selectedDoctorInfo: doctorInfo 
      };
      console.log("[HomeScheduling] Tentativa de agendamento salva:", schedulingAttempt);
      
      setTimeout(() => {
        navigate('/login', { state: { fromScheduling: true, schedulingAttempt } });
      }, 2000);
    }
  };
  
  // The useEffect for fetching selected doctor info is no longer needed here,
  // as setSelectedDoctor from the hook (handleDoctorSelection) already fetches and sets doctorInfo.

  return (
    <section className="py-16 bg-white">
      <div className="hopecann-container max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">Agende sua Consulta</h1>
        <p className="text-lg text-center text-gray-600 mb-10">
          Preencha os dados abaixo para agendar sua consulta com um de nossos especialistas
        </p>
        
        {!dbStatus.success && (
          <div className="mb-6 p-3 bg-orange-100 text-orange-800 rounded-md text-sm mx-auto max-w-lg text-center">
            <p>Informação para desenvolvedor: {dbStatus.message}</p>
          </div>
        )}
        
        <StepIndicator currentStep={step} />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {step === 1 && (
            <DoctorStep 
              doctors={doctors}
              isLoading={isLoading} // isLoading for doctor list
              selectedDoctor={selectedDoctor}
              setSelectedDoctor={setSelectedDoctor} // from hook
              onNext={localHandleNext}
              dbStatus={dbStatus}
            />
          )}
          
          {step === 2 && (
            <DateTimeStep 
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              setSelectedDate={setSelectedDate} // from hook
              setSelectedTime={setSelectedTime} // from hook
              onNext={localHandleNext}
              onBack={handleBack} // from hook
              doctorId={selectedDoctor}
            />
          )}
          
          {step === 3 && (
            <UserDataStep 
              formData={formData}
              handleFormChange={localHandleFormChange}
              onSubmit={localHandleSubmit}
              onBack={handleBack} // from hook
            />
          )}
          
          {step === 4 && (
            <ConfirmationStep 
              selectedDoctorInfo={doctorInfo} // use doctorInfo from hook
              selectedDate={selectedDate}
              selectedTime={selectedTime}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeScheduling;
