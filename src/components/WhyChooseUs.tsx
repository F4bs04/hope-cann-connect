import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Stethoscope, Clock } from 'lucide-react';
const WhyChooseUs = () => {
  return <section className="py-20 bg-white relative overflow-hidden">
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
              {[{
              text: "Equipe médica especializada em cannabis medicinal"
            }, {
              text: "Tratamentos personalizados e baseados em evidências"
            }, {
              text: "Acompanhamento contínuo do paciente"
            }, {
              text: "Medicamentos de qualidade e procedência garantida"
            }].map((item, index) => <div key={index} className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="bg-[#00D1C7] rounded-full p-1">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-700">{item.text}</p>
                </div>)}
            </div>
            
            <Link to="/sobre" className="inline-flex items-center text-[#00D1C7] hover:text-[#00D1C7]/80 font-medium">
              Conheça nossa história
              <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          
          <div className="space-y-8">
            <div className="relative">
              <img src="/uploads/56a3d208-4531-4149-8970-665bc4fe0edd.png" alt="Médica especialista" className="w-full rounded-2xl" />
              
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              
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
    </section>;
};
export default WhyChooseUs;