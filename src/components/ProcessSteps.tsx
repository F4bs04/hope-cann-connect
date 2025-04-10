
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
          {/* Timeline container */}
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical connecting line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-hopecann-teal/40 -ml-px md:ml-0 transform md:translate-x-[-0.5px]"></div>
            
            {/* Timeline steps */}
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} items-center md:items-start gap-6`}>
                  {/* Timeline dot/icon */}
                  <div className="absolute left-0 md:left-1/2 transform md:translate-x-[-50%] mt-6 md:mt-0 z-10">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-hopecann-teal text-white shadow-md border-4 border-white">
                      <step.icon className="w-5 h-5" />
                    </div>
                  </div>
                  
                  {/* Content box */}
                  <div className={`w-full md:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'md:pr-0 md:pl-6' : 'md:pl-0 md:pr-6'} pl-16 md:pl-0`}>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <span className="bg-hopecann-teal/10 text-hopecann-teal text-xs font-medium px-2.5 py-0.5 rounded-full mb-3 inline-block">
                        Etapa {index + 1}
                      </span>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link
              to="/agendar"
              className="inline-flex items-center justify-center bg-hopecann-teal text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-hopecann-teal/90 transition-colors btn-hover-scale"
            >
              Agendar Minha Consulta
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
