
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { StepIndicator } from './StepIndicator';
import { DoctorStep } from './DoctorStep';
import { DateTimeStep } from './DateTimeStep';
import { UserDataStep } from './UserDataStep';
import { ConfirmationStep } from './ConfirmationStep';
import { fetchDoctors } from './utils/doctorUtils';

const HomeScheduling = () => {
  // State management
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedConsultType, setSelectedConsultType] = useState("primeira");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    symptoms: "",
    previous_treatments: ""
  });
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState(null);
  const [doctors, setDoctors] = useState([]);
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
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'phone') {
      // Import and use the formatter
      const { formatTelefone } = require('@/utils/formatters');
      formattedValue = formatTelefone(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };
  
  // Navigation functions
  const handleNext = () => {
    // If we're on step 2 (Date selection), go directly to user data (step 3)
    if (step === 2) {
      setStep(3);
    } else {
      setStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    setStep(prev => prev - 1);
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      toast({
        title: "Agendamento recebido",
        description: "Você será redirecionado para fazer login ou criar uma conta para confirmar seu agendamento.",
      });
      
      setTimeout(() => {
        navigate('/cadastro');
      }, 2000);
    } catch (error) {
      console.error("Error submitting appointment:", error);
      toast({
        title: "Erro no agendamento",
        description: "Ocorreu um erro ao processar seu agendamento. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  // Fetch doctor info when selectedDoctor changes
  useEffect(() => {
    if (selectedDoctor) {
      const { supabase } = require("@/integrations/supabase/client");
      
      const fetchDoctorInfo = async () => {
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
