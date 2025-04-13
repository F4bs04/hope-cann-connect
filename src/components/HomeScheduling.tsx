
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Mail, Phone, FileText, CalendarCheck, CheckCircle, Search } from 'lucide-react';
import DoctorSearch from './DoctorSearch';
import { formatTelefone } from '@/utils/formatters';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

const generateAvailableDays = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days.push(date);
    }
  }
  
  return days;
};

const consultTypes = [
  { id: "primeira", name: "Primeira Consulta", price: "R$ 350,00", duration: "60 min" },
  { id: "retorno", name: "Consulta de Retorno", price: "R$ 250,00", duration: "30 min" },
  { id: "acompanhamento", name: "Acompanhamento", price: "R$ 200,00", duration: "30 min" }
];

const HomeScheduling = () => {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedConsultType, setSelectedConsultType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    symptoms: "",
    previous_treatments: ""
  });
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState(null);
  const { toast } = useToast();
  
  const navigate = useNavigate();
  const availableDays = generateAvailableDays();
  
  // Fetch selected doctor info when doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
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
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Apply phone number formatting
    if (name === 'phone') {
      formattedValue = formatTelefone(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };
  
  const handleNext = () => {
    setStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setStep(prev => prev - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Here you could add the logic to create a consultation in the database
      // For now, we'll just show a success message
      toast({
        title: "Agendamento recebido",
        description: "Você será redirecionado para fazer login ou criar uma conta para confirmar seu agendamento.",
      });
      
      setTimeout(() => {
        navigate('/login');
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
  
  return (
    <section className="py-16 bg-white">
      <div className="hopecann-container max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">Agende sua Consulta</h2>
        <p className="text-lg text-center text-gray-600 mb-10">
          Preencha os dados abaixo para agendar sua consulta com um de nossos especialistas
        </p>
        
        <div className="mb-12">
          <div className="flex justify-between items-center w-full max-w-3xl mx-auto relative">
            <div className="absolute top-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
            
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= stepNumber ? 'bg-hopecann-teal text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stepNumber}
                </div>
                <span className={`text-xs mt-2 ${step >= stepNumber ? 'text-hopecann-teal' : 'text-gray-500'}`}>
                  {
                    stepNumber === 1 ? 'Especialista' :
                    stepNumber === 2 ? 'Data e Hora' :
                    stepNumber === 3 ? 'Tipo' :
                    stepNumber === 4 ? 'Dados' : 'Confirmação'
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <User className="text-hopecann-teal" />
                Escolha um Especialista
              </h2>
              
              <DoctorSearch onSelectDoctor={(doctorId) => {
                setSelectedDoctor(doctorId);
                console.log("Selected doctor ID:", doctorId);
              }} />
              
              <div className="flex justify-end">
                <button
                  className="bg-hopecann-teal text-white px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleNext}
                  disabled={!selectedDoctor}
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Calendar className="text-hopecann-teal" />
                Escolha a Data e Horário
              </h2>
              
              <div className="mb-8">
                <h3 className="font-medium mb-3">Data da Consulta</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-8">
                  {availableDays.map((date, index) => (
                    <div 
                      key={index}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors text-center ${
                        selectedDate && selectedDate.getTime() === date.getTime() 
                          ? 'border-hopecann-teal bg-hopecann-teal/5' 
                          : 'border-gray-200 hover:border-hopecann-teal/50'
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <p className="text-sm text-gray-500">{format(date, 'E', { locale: ptBR })}</p>
                      <p className="font-medium">{format(date, 'dd')}</p>
                      <p className="text-sm">{format(date, 'MMM', { locale: ptBR })}</p>
                    </div>
                  ))}
                </div>
                
                {selectedDate && (
                  <>
                    <h3 className="font-medium mb-3">Horário Disponível</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {timeSlots.map((time, index) => (
                        <div 
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors text-center flex items-center justify-center gap-2 ${
                            selectedTime === time 
                              ? 'border-hopecann-teal bg-hopecann-teal/5' 
                              : 'border-gray-200 hover:border-hopecann-teal/50'
                          }`}
                          onClick={() => setSelectedTime(time)}
                        >
                          <Clock size={16} />
                          <span>{time}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-between">
                <button
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-50"
                  onClick={handleBack}
                >
                  Voltar
                </button>
                <button
                  className="bg-hopecann-teal text-white px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleNext}
                  disabled={!selectedDate || !selectedTime}
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FileText className="text-hopecann-teal" />
                Tipo de Consulta
              </h2>
              
              <div className="space-y-4 mb-8">
                {consultTypes.map((type) => (
                  <div 
                    key={type.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedConsultType === type.id 
                        ? 'border-hopecann-teal bg-hopecann-teal/5' 
                        : 'border-gray-200 hover:border-hopecann-teal/50'
                    }`}
                    onClick={() => setSelectedConsultType(type.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className={`w-5 h-5 rounded-full border flex-shrink-0 mt-1 ${
                          selectedConsultType === type.id 
                            ? 'border-hopecann-teal bg-hopecann-teal' 
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedConsultType === type.id && (
                          <CheckCircle className="text-white w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{type.name}</h3>
                          <span className="font-semibold text-hopecann-teal">{type.price}</span>
                        </div>
                        <p className="text-sm text-gray-600">Duração: {type.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between">
                <button
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-50"
                  onClick={handleBack}
                >
                  Voltar
                </button>
                <button
                  className="bg-hopecann-teal text-white px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleNext}
                  disabled={!selectedConsultType}
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
          
          {step === 4 && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <User className="text-hopecann-teal" />
                Seus Dados
              </h2>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
                      value={formData.email}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-1">Telefone/WhatsApp *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
                      value={formData.phone}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="symptoms" className="block text-gray-700 mb-1">Principais Sintomas/Queixas *</label>
                  <textarea
                    id="symptoms"
                    name="symptoms"
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
                    value={formData.symptoms}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="previous_treatments" className="block text-gray-700 mb-1">Tratamentos Anteriores</label>
                  <textarea
                    id="previous_treatments"
                    name="previous_treatments"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
                    value={formData.previous_treatments}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-50"
                  onClick={handleBack}
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="bg-hopecann-teal text-white px-6 py-2 rounded-full"
                >
                  Finalizar Agendamento
                </button>
              </div>
            </form>
          )}
          
          {step === 5 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-hopecann-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarCheck className="h-8 w-8 text-hopecann-teal" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Agendamento Concluído!</h2>
              <p className="text-gray-700 mb-8 max-w-lg mx-auto">
                Sua consulta foi agendada com sucesso. Em breve você receberá um e-mail e um WhatsApp com a confirmação e detalhes da sua consulta.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="font-semibold mb-4">Resumo do Agendamento</h3>
                
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Médico:</span>
                    <span className="font-medium">
                      {selectedDoctorInfo?.nome || "Médico não especificado"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium">
                      {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : ""}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Horário:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo de Consulta:</span>
                    <span className="font-medium">
                      {consultTypes.find(t => t.id === selectedConsultType)?.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeScheduling;
