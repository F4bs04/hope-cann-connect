import React from 'react';
import { CalendarClock, UserCircle, ClipboardCheck, Video, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
const steps = [{
  number: "01",
  icon: ClipboardCheck,
  title: "Cadastro",
  description: "Crie sua conta em menos de 2 minutos e acesse nossa plataforma."
}, {
  number: "02",
  icon: UserCircle,
  title: "Escolha do Médico",
  description: "Encontre o especialista ideal baseado em sua condição e preferências."
}, {
  number: "03",
  icon: CalendarClock,
  title: "Agendamento",
  description: "Escolha data e horário disponíveis que melhor se adequem à sua rotina."
}, {
  number: "04",
  icon: Video,
  title: "Consulta",
  description: "Atendimento somente online com seu médico especialista."
}, {
  number: "05",
  icon: FileText,
  title: "Tratamento",
  description: "Receba seu plano personalizado e acompanhamento contínuo."
}];
const ProcessSteps = () => {
  return <section id="como-funciona" className="hopecann-section bg-gradient-to-r from-white to-green-50/50 py-20 bg-green-100">
      <div className="hopecann-container">
        <div className="text-center mb-16">
          <h2 className="hopecann-section-title text-hopecann-green">Como funciona</h2>
          <p className="hopecann-section-subtitle">
            Um processo simples e humanizado para iniciar seu tratamento
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {steps.map((step, index) => <div key={index} className="flex flex-col h-full">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-hopecann-teal/40 hover:shadow-md transition-all h-full overflow-hidden">
                  <div className="flex flex-col h-full">
                    {/* Icon container */}
                    <div className="p-5 flex justify-center">
                      <div className="bg-hopecann-teal w-16 h-16 rounded-lg flex items-center justify-center text-white">
                        <step.icon size={32} />
                      </div>
                    </div>
                    
                    {/* Step number */}
                    <div className="text-hopecann-teal/20 text-5xl font-bold text-center">
                      {step.number}
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 pt-3 flex-grow">
                      <h3 className="text-xl font-semibold mb-3 text-gray-800">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <Link to="/agendar" className="inline-flex items-center justify-center bg-hopecann-teal text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-hopecann-teal/90 transition-colors btn-hover-scale shadow-md">
            Iniciar Tratamento
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>;
};
export default ProcessSteps;