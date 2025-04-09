
import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative py-16 md:py-28 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="/lovable-uploads/31b21e55-c292-47fb-888b-f884e7027019.png" 
          alt="Médicos especialistas" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/30"></div>
      </div>
      
      <div className="hopecann-container relative z-10">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
            Tratamento Canábico Personalizado
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in" style={{animationDelay: '0.2s'}}>
            Descubra o poder da medicina canábica com nossa equipe especializada de profissionais.
          </p>
          <div className="flex flex-wrap gap-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Link 
              to="/agendar" 
              className="hopecann-btn-primary bg-hopecann-teal hover:bg-hopecann-teal/90 text-lg"
            >
              Consulta Online
            </Link>
            <Link 
              to="/tratamentos" 
              className="hopecann-btn-secondary bg-white hover:bg-white/90 text-lg"
            >
              Saiba Mais
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
