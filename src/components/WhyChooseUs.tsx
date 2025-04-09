
import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Check, FileText, HeartPulse, AlarmClock, Leaf } from 'lucide-react';

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute left-0 top-0 w-64 h-64 bg-hopecann-teal/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-hopecann-teal/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
      
      <div className="hopecann-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-hopecann-teal/10 text-hopecann-teal border border-hopecann-teal/20 text-sm font-medium mb-4">
              Por que escolher a HopeCann
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Transformando vidas através da medicina canábica especializada
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Na HopeCann, combinamos ciência de ponta com atendimento humanizado. Nossa abordagem única oferece tratamentos personalizados para diversas condições médicas, com resultados comprovados e acompanhamento contínuo.
            </p>
            
            <div className="space-y-4 mb-8">
              {[
                { text: "Equipe médica especializada em cannabis medicinal" },
                { text: "Tratamentos personalizados e baseados em evidências" },
                { text: "Acompanhamento contínuo do paciente" },
                { text: "Medicamentos de qualidade e procedência garantida" }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1 bg-hopecann-teal rounded-full p-1 flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
            
            <Link 
              to="/sobre" 
              className="inline-flex items-center text-hopecann-teal hover:text-hopecann-teal/80 font-medium"
            >
              Conheça nossa história
              <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="hopecann-stat-card col-span-2">
              <img 
                src="/lovable-uploads/54efb4d4-b8e5-4450-be5f-00aadc8c6c37.png" 
                alt="Médicos especialistas" 
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-1">Medicina canábica de qualidade</h3>
              <p className="text-gray-600">Tratamentos baseados em evidências científicas e protocolos avançados.</p>
            </div>
            
            <div className="hopecann-stat-card">
              <div className="bg-hopecann-teal/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <HeartPulse className="h-6 w-6 text-hopecann-teal" />
              </div>
              <div className="hopecann-stat-value">95%</div>
              <div className="hopecann-stat-label">Taxa de satisfação dos pacientes</div>
            </div>
            
            <div className="hopecann-stat-card">
              <div className="bg-hopecann-teal/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <AlarmClock className="h-6 w-6 text-hopecann-teal" />
              </div>
              <div className="hopecann-stat-value">1500+</div>
              <div className="hopecann-stat-label">Consultas realizadas</div>
            </div>
            
            <div className="hopecann-stat-card">
              <div className="bg-hopecann-teal/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-hopecann-teal" />
              </div>
              <div className="hopecann-stat-value">10+</div>
              <div className="hopecann-stat-label">Condições tratadas</div>
            </div>
            
            <div className="hopecann-stat-card">
              <div className="bg-hopecann-teal/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-hopecann-teal" />
              </div>
              <div className="hopecann-stat-value">5+</div>
              <div className="hopecann-stat-label">Anos de experiência</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
