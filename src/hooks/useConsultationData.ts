
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
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctorInternal] = useState<string | null>(null); // Renamed to avoid conflict with exported setSelectedDoctor
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
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
  
  // Original handleNext from hook, kept for other components that might use it
  const originalHandleNext = () => {
    if (step === 2) { // Specific logic for Agendar.tsx which might have different step count or flow
      setStep(3);
    } else {
      setStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    setStep(prev => prev - 1);
  };
  
  // Original handleSubmit from hook, kept for Agendar.tsx
  const originalHandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/cadastro');
  };

  const fetchDoctorInfo = async (doctorId: string) => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, user_id, specialty, biography, consultation_fee, profiles!inner(full_name, avatar_url)')
        .eq('id', doctorId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching doctor info:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar informações do médico selecionado.",
          variant: "destructive"
        });
        setDoctorInfo(null); // Clear doctor info on error
        return;
      }
      
      setDoctorInfo(data || null); // Set to null if data is null
    } catch (error) {
      console.error("Error in fetchDoctorInfo:", error);
      setDoctorInfo(null); // Clear doctor info on error
    }
  };
  
  const handleDoctorSelection = (doctorId: string | null) => { // Allow null to deselect
    setSelectedDoctorInternal(doctorId);
    if (doctorId) {
      fetchDoctorInfo(doctorId);
    } else {
      setDoctorInfo(null); // Clear doctor info if deselected
    }
  };
  
  return {
    step,
    setStep, // Exporting raw setStep
    selectedDoctor,
    setSelectedDoctor: handleDoctorSelection, // This is the function that also fetches doctor info
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedConsultType,
    setSelectedConsultType,
    formData,
    setFormData, // Exporting raw setFormData
    doctorInfo,
    handleFormChange, // Original event-based handler
    handleNext: originalHandleNext, // Original handler
    handleBack,
    handleSubmit: originalHandleSubmit, // Original handler
  };
}
