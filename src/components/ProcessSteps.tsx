
import React from 'react';
import { CalendarClock, UserCircle, ClipboardCheck, Video, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: CalendarClock,
    title: "Agendamento",
    description: "Escolha o médico, data e horário mais convenientes para você."
  },
  {
    icon: ClipboardCheck,
    title: "Pré-Consulta",
    description: "Preencha o formulário com seu histórico médico e sintomas atuais."
  },
  {
    icon: Video,
    title: "Consulta",
    description: "Atendimento online ou presencial com médico especialista."
  },
  {
    icon: FileText, 
    title: "Tratamento",
    description: "Receba seu plano personalizado e acompanhamento contínuo."
  }
];

const ProcessSteps = () => {
  return (
    <section className="hopecann-section bg-gradient-to-r from-white to-green-50/50">
      <div className="hopecann-container">
        <h2 className="hopecann-section-title text-hopecann-green">Como funciona</h2>
        <p className="hopecann-section-subtitle">
          Um processo simples e humanizado para iniciar seu tratamento
        </p>
        
        <div className="mt-16 relative">
          {/* Horizontal Timeline container */}
          <div className="max-w-5xl mx-auto relative px-4">
            {/* Horizontal connecting line */}
            <div className="absolute left-0 right-0 top-24 h-0.5 bg-hopecann-teal/40"></div>
            
            {/* Timeline steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  {/* Timeline dot/icon */}
                  <div className="relative z-10 mb-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-hopecann-teal text-white shadow-md border-4 border-white hover:scale-110 transition-transform">
                      <step.icon className="w-7 h-7" />
                    </div>
                  </div>
                  
                  {/* Step number - UPDATED FROM OPACITY TO SOLID */}
                  <div className="bg-hopecann-green text-white text-xs font-medium px-3 py-1 rounded-full mb-3 inline-block">
                    Etapa {index + 1}
                  </div>
                  
                  {/* Content box */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100 hover:shadow-md hover:border-hopecann-teal/30 transition-all h-full w-full">
                    <h3 className="text-xl font-semibold mb-2 text-hopecann-green">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  
                  {/* Arrow between steps (except after last step) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-24 transform translate-x-[50%] right-0">
                      <ArrowRight className="w-5 h-5 text-hopecann-teal" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link
              to="/agendar"
              className="inline-flex items-center justify-center bg-hopecann-green text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-hopecann-green/90 transition-colors btn-hover-scale shadow-md"
            >
              Agendar Minha Consulta
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-green-100 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-hopecann-teal/10 rounded-full opacity-40 translate-x-1/4 translate-y-1/4"></div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
