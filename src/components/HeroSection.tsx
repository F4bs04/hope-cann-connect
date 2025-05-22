
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Clock, Heart } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="/lovable-uploads/1c16dd34-4732-46fc-aa92-a9994398ea88.png" 
          alt="Médico especialista" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 to-gray-900/60"></div>
      </div>
      
      {/* Decoração */}
      <div className="absolute right-0 top-1/3 -translate-y-1/2 opacity-10">
        <img 
          src="/lovable-uploads/34122bd7-3398-483c-91bf-6d0c1a1ca29c.png"
          alt=""
          className="w-64 md:w-96 opacity-20"
        />
      </div>
      
      <div className="hopecann-container relative z-10">
        <div className="max-w-2xl text-white">
          <span className="inline-block px-4 py-1.5 rounded-full bg-hopecann-teal/20 text-hopecann-teal border border-hopecann-teal/40 text-sm font-medium mb-6 animate-fade-in">
            Medicina Canábica Especializada
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in leading-tight">
            Tratamento Canábico<br />Personalizado
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in delay-100">
            Descubra o poder da medicina canábica com nossa equipe especializada e uma abordagem centrada no paciente.
          </p>
          
          <div className="flex flex-wrap gap-4 animate-fade-in delay-200">
            <Link 
              to="/agendar" 
              className="hopecann-btn-primary bg-hopecann-teal hover:bg-hopecann-teal/90 text-lg px-8 py-3 btn-hover-scale flex items-center"
            >
              Agendar Consulta <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              to="/tratamentos" 
              className="hopecann-btn-secondary bg-transparent border-white text-white hover:bg-white/10 text-lg"
            >
              Conhecer Tratamentos
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-fade-in delay-300">
            <div className="flex items-center">
              <div className="mr-3 bg-hopecann-teal/20 p-2 rounded-full">
                <Award className="h-5 w-5 text-hopecann-teal" />
              </div>
              <div>
                <span className="block text-white/90 text-sm">Atendimento</span>
                <span className="font-semibold">Personalizado</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="mr-3 bg-hopecann-teal/20 p-2 rounded-full">
                <Heart className="h-5 w-5 text-hopecann-teal" />
              </div>
              <div>
                <span className="block text-white/90 text-sm">Equipe</span>
                <span className="font-semibold">Especializada</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="mr-3 bg-hopecann-teal/20 p-2 rounded-full">
                <Clock className="h-5 w-5 text-hopecann-teal" />
              </div>
              <div>
                <span className="block text-white/90 text-sm">Acompanhamento</span>
                <span className="font-semibold">Contínuo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
