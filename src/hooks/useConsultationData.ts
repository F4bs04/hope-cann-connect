
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface FormData {
  name: string;
  email: string;
  phone: string;
  symptoms: string;
  previous_treatments: string;
}

export function useConsultationData() {
  // Removed consultation type step - now we have only 3 steps instead of 4
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  // Auto-select the first consultation type
  const [selectedConsultType, setSelectedConsultType] = useState("primeira");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    symptoms: "",
    previous_treatments: ""
  });
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // After form submission, redirect to the Cadastro page
    navigate('/cadastro');
  };

  const fetchDoctorInfo = async (doctorId: number) => {
    try {
      const { data, error } = await supabase
        .from('medicos')
        .select('*')
        .eq('id', doctorId)
        .maybeSingle();
        
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
        setDoctorInfo(data);
      }
    } catch (error) {
      console.error("Error in fetchDoctorInfo:", error);
    }
  };
  
  const handleDoctorSelection = (doctorId: number) => {
    setSelectedDoctor(doctorId);
    fetchDoctorInfo(doctorId);
  };
  
  return {
    step,
    selectedDoctor,
    selectedDate,
    selectedTime,
    selectedConsultType,
    formData,
    doctorInfo,
    setStep,
    setSelectedDoctor: handleDoctorSelection,
    setSelectedDate,
    setSelectedTime,
    setSelectedConsultType,
    handleFormChange,
    handleNext,
    handleBack,
    handleSubmit,
  };
}
