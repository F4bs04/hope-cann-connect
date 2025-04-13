
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Mail, Phone, FileText, CalendarCheck, CheckCircle, Search } from 'lucide-react';
import { formatTelefone } from '@/utils/formatters';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  availability: string[];
}

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
  // Removed consultation type step - now we have only 3 steps instead of 4
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  // Auto-select the first consultation type
  const [selectedConsultType, setSelectedConsultType] = useState("primeira");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    symptoms: "",
    previous_treatments: ""
  });
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{success: boolean, message: string}>({
    success: true,
    message: ''
  });
  const { toast } = useToast();
  
  const navigate = useNavigate();
  const availableDays = generateAvailableDays();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching doctors for scheduling from Supabase...");
        
        const { data, error } = await supabase
          .from('medicos')
          .select('*');
          
        if (error) {
          console.error('Error fetching doctors:', error);
          setDbStatus({
            success: false,
            message: `Erro ao buscar médicos: ${error.message}`
          });
          throw error;
        }
        
        console.log(`Total de médicos encontrados: ${data?.length || 0}`);
        
        if (data && data.length > 0) {
          console.log("Médicos encontrados:", data);
          
          const doctorsWithAvailability = data.map(doctor => {
            const availability = ['next-week'];
            
            return {
              id: doctor.id,
              name: doctor.nome,
              specialty: doctor.especialidade || "Medicina Canábica",
              bio: doctor.biografia || 'Especialista em tratamentos canábicos.',
              image: doctor.foto_perfil || `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`,
              availability
            };
          });
          
          setDoctors(doctorsWithAvailability);
          setDbStatus({
            success: true,
            message: `${doctorsWithAvailability.length} médicos encontrados`
          });
        } else {
          console.log("Nenhum médico encontrado, usando dados de fallback");
          setDbStatus({
            success: false,
            message: 'Nenhum médico encontrado na tabela medicos'
          });
          
          setDoctors([{
            id: 1,
            name: "Dr. Ricardo Silva",
            specialty: "Neurologista",
            bio: "Especialista em tratamentos canábicos para distúrbios neurológicos.",
            image: `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`,
            availability: ['today', 'this-week']
          }, {
            id: 2,
            name: "Dra. Ana Santos",
            specialty: "Psiquiatra",
            bio: "Especializada em tratamentos para ansiedade e depressão com abordagem integrativa.",
            image: `/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png`,
            availability: ['this-week']
          }, {
            id: 3,
            name: "Dr. Carlos Mendes",
            specialty: "Neurologista",
            bio: "Especialista em epilepsia e doenças neurodegenerativas, com foco em tratamentos inovadores.",
            image: `/lovable-uploads/8e0e4c0d-f012-449c-9784-9be7170458f5.png`,
            availability: ['next-week']
          }]);
        }
      } catch (error) {
        console.error('Error in fetchDoctors:', error);
        toast({
          title: "Erro ao carregar médicos",
          description: "Não foi possível carregar a lista de médicos. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });

        setDoctors([{
          id: 1,
          name: "Dr. Ricardo Silva",
          specialty: "Neurologista",
          bio: "Especialista em tratamentos canábicos para distúrbios neurológicos.",
          image: `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`,
          availability: ['today', 'this-week']
        }, {
          id: 2,
          name: "Dra. Ana Santos",
          specialty: "Psiquiatra",
          bio: "Especializada em tratamentos para ansiedade e depressão com abordagem integrativa.",
          image: `/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png`,
          availability: ['this-week']
        }, {
          id: 3,
          name: "Dr. Carlos Mendes",
          specialty: "Neurologista",
          bio: "Especialista em epilepsia e doenças neurodegenerativas, com foco em tratamentos inovadores.",
          image: `/lovable-uploads/8e0e4c0d-f012-449c-9784-9be7170458f5.png`,
          availability: ['next-week']
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctors();
  }, [toast]);
  
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
    
    if (name === 'phone') {
      formattedValue = formatTelefone(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      toast({
        title: "Agendamento recebido",
        description: "Você será redirecionado para fazer login ou criar uma conta para confirmar seu agendamento.",
      });
      
      setTimeout(() => {
        // Redirect to cadastro page instead of login
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

  const handleDoctorSelection = (doctorId) => {
    setSelectedDoctor(doctorId);
    console.log("Selected doctor ID:", doctorId);
  };
  
  return (
    <section className="py-16 bg-white">
      <div className="hopecann-container max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">Agende sua Consulta</h2>
        <p className="text-lg text-center text-gray-600 mb-10">
          Preencha os dados abaixo para agendar sua consulta com um de nossos especialistas
        </p>
        
        {!dbStatus.success && (
          <div className="mb-6 p-3 bg-orange-100 text-orange-800 rounded-md text-sm mx-auto max-w-lg text-center">
            <p>Informação para desenvolvedor: {dbStatus.message}</p>
          </div>
        )}
        
        <div className="mb-12">
          <div className="flex justify-between items-center w-full max-w-3xl mx-auto relative">
            <div className="absolute top-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
            
            {/* Updated step indicator: removed consultation type step */}
            {[1, 2, 3, 4].map((stepNumber) => (
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
                    stepNumber === 3 ? 'Dados' : 'Confirmação'
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
              
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar médico por nome ou especialidade..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
                    />
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hopecann-teal"></div>
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Nenhum médico encontrado</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Não encontramos médicos com os critérios de busca. Tente ajustar seus critérios ou volte mais tarde.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedDoctor === doctor.id 
                            ? 'border-hopecann-teal bg-hopecann-teal/5' 
                            : 'border-gray-200 hover:border-hopecann-teal/50'
                        }`}
                        onClick={() => handleDoctorSelection(doctor.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                            <img 
                              src={doctor.image} 
                              alt={doctor.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{doctor.name}</h3>
                                <p className="text-sm text-hopecann-teal mb-1">{doctor.specialty}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 
                                ${doctor.availability.includes('today') 
                                  ? 'bg-green-100 text-green-800' 
                                  : doctor.availability.includes('this-week')
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                                }`}>
                                <Clock size={12} />
                                {doctor.availability.includes('today') 
                                  ? 'Hoje' 
                                  : doctor.availability.includes('this-week')
                                  ? 'Esta semana'
                                  : 'Próxima semana'
                                }
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
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
          
          {step === 4 && (
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
                      Primeira Consulta
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
