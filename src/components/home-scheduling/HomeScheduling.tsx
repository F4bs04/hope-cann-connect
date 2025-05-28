import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { StepIndicator } from './StepIndicator';
import { DoctorStep } from './DoctorStep';
import { DateTimeStep } from './DateTimeStep';
import { UserDataStep } from './UserDataStep';
import { ConfirmationStep } from './ConfirmationStep';
import { fetchDoctors } from './utils/doctorUtils';
import { formatTelefone } from '@/utils/formatters';
import { supabase } from "@/integrations/supabase/client";
import { createConsulta } from '@/services/consultas/consultasService';

const HomeScheduling = () => {
  // State management
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedConsultType, setSelectedConsultType] = useState("primeira");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    symptoms: "",
    previous_treatments: ""
  });
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState({
    success: true,
    message: ''
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Load doctors on mount
  useEffect(() => {
    fetchDoctors({ setDoctors, setIsLoading, setDbStatus, toast });
  }, [toast]);
  
  // Form handling functions
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'phone') {
      formattedValue = formatTelefone(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };
  
  // Navigation functions
  const handleNext = () => {
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
    setStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setStep(prev => prev - 1);
  };
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();

    if (session && session.user) { // Usuário está logado
      try {
        const { data: usuarioData, error: usuarioError } = await supabase
          .from('usuarios')
          .select('id, tipo_usuario')
          .eq('email', session.user.email)
          .single();

        if (usuarioError || !usuarioData) {
          toast({ title: "Erro de Usuário", description: "Não foi possível verificar seus dados de usuário.", variant: "destructive" });
          return;
        }

        if (usuarioData.tipo_usuario !== 'paciente') {
          toast({ title: "Ação não permitida", description: "Apenas pacientes podem agendar consultas através desta interface.", variant: "destructive" });
          return;
        }
        
        const { data: pacienteData, error: pacienteError } = await supabase
          .from('pacientes')
          .select('id')
          .eq('id_usuario', usuarioData.id)
          .single();

        if (pacienteError || !pacienteData) {
          toast({ title: "Perfil de Paciente Incompleto", description: "Não encontramos seu perfil de paciente. Por favor, complete seu cadastro ou entre em contato com o suporte.", variant: "destructive" });
          // Opcional: Redirecionar para completar o perfil
          // navigate('/area-paciente/perfil', { state: { fromScheduling: true, schedulingAttempt: { selectedDoctor, selectedDate: selectedDate?.toISOString(), selectedTime, selectedConsultType, formData } } });
          return;
        }

        const pacienteId = pacienteData.id;

        if (!selectedDoctor || !selectedDate || !selectedTime) {
          toast({ title: "Dados Incompletos", description: "Médico, data ou horário não selecionados.", variant: "destructive" });
          return;
        }
        
        const dataHora = new Date(selectedDate);
        const [hours, minutes] = selectedTime.split(':').map(Number);
        dataHora.setHours(hours, minutes, 0, 0);

        const consultaParaSalvar = {
          id_medico: selectedDoctor,
          id_paciente: pacienteId,
          data_hora: dataHora.toISOString(),
          status: 'agendada',
          tipo_consulta: selectedConsultType,
          motivo: formData.symptoms,
          observacoes_paciente: formData.previous_treatments || null,
        };

        const createdConsulta = await createConsulta(consultaParaSalvar);

        if (createdConsulta) {
          toast({ title: "Agendamento Concluído!", description: "Sua consulta foi agendada com sucesso." });
          setStep(4); // Avança para a tela de confirmação
        } else {
          // Erro já tratado no toast dentro de createConsulta ou pelo catch abaixo
          // Se createConsulta retornar null sem throw, um toast genérico é necessário aqui.
          // No entanto, a versão atual do createConsulta lança erro ou retorna dados.
        }
      } catch (error: any) {
        console.error("Erro ao agendar consulta (usuário logado):", error);
        toast({ title: "Erro no Agendamento", description: error.message || "Ocorreu um erro ao tentar agendar sua consulta.", variant: "destructive" });
      }
    } else { // Usuário NÃO está logado
      toast({
        title: "Login Necessário",
        description: "Você será redirecionado para fazer login ou criar uma conta para confirmar seu agendamento.",
      });
      
      const schedulingAttempt = {
        selectedDoctor,
        selectedDate: selectedDate?.toISOString(), // Serializa Date para string
        selectedTime,
        selectedConsultType,
        formData,
        selectedDoctorInfo // Passa informações do médico já carregadas
      };
      
      setTimeout(() => {
        navigate('/login', { state: { fromScheduling: true, schedulingAttempt } });
      }, 2000);
    }
  };
  
  // Fetch doctor info when selectedDoctor changes
  useEffect(() => {
    if (selectedDoctor) {
      const fetchDoctorInfo = async () => {
        try {
          const { data, error } = await supabase
            .from('medicos')
            .select('*')
            .eq('id', selectedDoctor)
            .single();
            
          if (error) {
            console.error("Error fetching doctor info:", error);
            toast({
              title: "Erro",
              description: "Não foi possível carregar informações do médico selecionado.",
              variant: "destructive"
            });
            return;
          }
          
          if (data) {
            setSelectedDoctorInfo(data);
          }
        } catch (err) {
          console.error("Error fetching doctor info:", err);
          toast({
            title: "Erro de sistema",
            description: "Ocorreu um erro ao carregar dados do médico. Por favor tente novamente.",
            variant: "destructive"
          });
        }
      };
      
      fetchDoctorInfo();
    }
  }, [selectedDoctor, toast]);

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
              isLoading={isLoading}
              selectedDoctor={selectedDoctor}
              setSelectedDoctor={setSelectedDoctor}
              onNext={handleNext}
              dbStatus={dbStatus}
            />
          )}
          
          {step === 2 && (
            <DateTimeStep 
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              setSelectedDate={setSelectedDate}
              setSelectedTime={setSelectedTime}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          
          {step === 3 && (
            <UserDataStep 
              formData={formData}
              handleFormChange={handleFormChange}
              onSubmit={handleSubmit}
              onBack={handleBack}
            />
          )}
          
          {step === 4 && (
            <ConfirmationStep 
              selectedDoctorInfo={selectedDoctorInfo}
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
