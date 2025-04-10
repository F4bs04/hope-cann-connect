
import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, CheckCircle, ArrowRight, CalendarCheck, Users, Briefcase } from 'lucide-react';
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: Users,
    title: "Amplie seu Alcance",
    description: "Conecte-se com pacientes em todo o Brasil através de nossa plataforma especializada."
  },
  {
    icon: CalendarCheck,
    title: "Gerencie sua Agenda",
    description: "Sistema inteligente de agendamento que integra com seu calendário existente."
  },
  {
    icon: Briefcase,
    title: "Suporte Especializado",
    description: "Nossa equipe de suporte ajuda com aspectos técnicos e regulatórios do tratamento canábico."
  }
];

const DoctorCTA = () => {
  return (
    <section className="hopecann-section py-24 bg-gradient-to-br from-hopecann-teal/5 to-white">
      <div className="hopecann-container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-hopecann-teal/10 text-hopecann-teal border border-hopecann-teal/20 text-sm font-medium mb-6">
            Para Profissionais de Saúde
          </span>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-hopecann-green">
            Faça parte da nossa rede de médicos especialistas
          </h2>
          
          <p className="text-lg text-gray-700 mb-8">
            Junte-se a uma comunidade crescente de profissionais de saúde comprometidos em oferecer tratamentos canábicos de qualidade e baseados em evidências científicas.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-green-100 hover:shadow-md hover:border-hopecann-teal/30 transition-all h-full">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-hopecann-teal/10 text-hopecann-teal mb-6">
                <benefit.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-hopecann-green">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-xl p-8 md:p-12 shadow-lg border border-green-100 max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-2/3">
              <h3 className="text-2xl font-bold mb-4 text-hopecann-green">Como se tornar um médico parceiro</h3>
              <ul className="space-y-3 mb-6">
                {[
                  "Preencha nosso formulário de cadastro",
                  "Forneça sua documentação profissional",
                  "Participe de nossa breve entrevista online",
                  "Receba acesso à plataforma e comece a atender"
                ].map((step, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-hopecann-teal mt-0.5 mr-2" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              
              <Button asChild variant="default" className="bg-hopecann-green hover:bg-hopecann-green/90 text-white">
                <Link to="/cadastro-medico" className="inline-flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  <span>Cadastre-se como Médico</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            
            <div className="lg:w-1/3">
              <img 
                src="/lovable-uploads/fdb4047f-8998-45c3-92d1-3af66294139a.png" 
                alt="Médico parceiro" 
                className="w-full h-auto rounded-lg shadow-md" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoctorCTA;
