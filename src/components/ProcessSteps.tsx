
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
    <section className="hopecann-section bg-gray-50">
      <div className="hopecann-container">
        <h2 className="hopecann-section-title">Como funciona</h2>
        <p className="hopecann-section-subtitle">
          Um processo simples e humanizado para iniciar seu tratamento
        </p>
        
        <div className="mt-16">
          <div className="relative">
            {/* Linha conectora (somente desktop) */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-hopecann-teal/30"></div>
            
            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 relative">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="relative z-10">
                    <div className="bg-hopecann-teal text-white p-5 rounded-full inline-flex mb-4">
                      <step.icon className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 w-full">
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  
                  {/* Seta para próximo passo (mobile) */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center my-2">
                      <ArrowRight className="h-6 w-6 text-hopecann-teal/70" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link
              to="/agendar"
              className="inline-block bg-hopecann-teal text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-hopecann-teal/90 transition-colors"
            >
              Agendar Minha Consulta
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
