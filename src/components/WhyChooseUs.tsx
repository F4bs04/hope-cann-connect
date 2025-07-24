
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Stethoscope, Clock } from 'lucide-react';

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
                  <div className="mt-1">
                    <div className="bg-[#00D1C7] rounded-full p-1">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
            
            <Link 
              to="/sobre" 
              className="inline-flex items-center text-[#00D1C7] hover:text-[#00D1C7]/80 font-medium"
            >
              Conheça nossa história
              <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          
          <div className="space-y-8">
            <div className="relative">
              <img 
                src="/lovable-uploads/b96d4f63-bd97-476d-a13b-7dc166c2697f.png"
                alt="Médica especialista" 
                className="w-full rounded-2xl"
              />
              <div className="absolute top-4 right-4 bg-[#36B37E] p-3 rounded-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM16.9 15.7L15.7 16.9C15.5 17.1 15.2 17.1 15 16.9L12 13.9L9 16.9C8.8 17.1 8.5 17.1 8.3 16.9L7.1 15.7C6.9 15.5 6.9 15.2 7.1 15L10.1 12L7.1 9C6.9 8.8 6.9 8.5 7.1 8.3L8.3 7.1C8.5 6.9 8.8 6.9 9 7.1L12 10.1L15 7.1C15.2 6.9 15.5 6.9 15.7 7.1L16.9 8.3C17.1 8.5 17.1 8.8 16.9 9L13.9 12L16.9 15C17.1 15.2 17.1 15.5 16.9 15.7Z" fill="white"/>
                </svg>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-[#36B37E] mb-2">
                Medicina canábica de qualidade
              </h3>
              <p className="text-gray-600 text-center">
                Tratamentos baseados em evidências científicas e protocolos avançados.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-[#F7FDFB] rounded-2xl border border-[#E3F5F5]">
                <div className="flex items-center justify-center mb-2">
                  <Stethoscope className="h-6 w-6 text-[#36B37E]" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#36B37E]">10+</p>
                  <p className="text-sm text-gray-600">Médicos especializados</p>
                </div>
              </div>

              <div className="p-6 bg-[#F7FDFB] rounded-2xl border border-[#E3F5F5]">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-[#36B37E]" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#36B37E]">1500+</p>
                  <p className="text-sm text-gray-600">Atendimento humanizado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

