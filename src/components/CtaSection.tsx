
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

const CtaSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-hopecann-teal to-hopecann-green/90"></div>
      
      {/* Decorative elements */}
      <div className="absolute right-0 bottom-0 opacity-10">
        <img 
          src="/lovable-uploads/34122bd7-3398-483c-91bf-6d0c1a1ca29c.png"
          alt=""
          className="w-64 md:w-96 opacity-20"
        />
      </div>
      
      <div className="hopecann-container relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white border border-white/30 text-sm font-medium mb-6">
            Comece sua jornada de bem-estar
          </span>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Inicie seu tratamento canábico hoje</h2>
          
          <p className="text-xl mb-10 text-white/90">
            Agende uma consulta online com nossos especialistas e descubra como o tratamento canábico personalizado pode transformar sua qualidade de vida.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/agendar" 
              className="inline-flex items-center justify-center bg-white text-hopecann-teal hover:bg-white/90 font-medium py-3 px-8 rounded-full text-lg btn-hover-scale"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Agendar Primeira Consulta
            </Link>
            
            <Link 
              to="/contato" 
              className="inline-flex items-center justify-center bg-transparent border border-white text-white hover:bg-white/10 font-medium py-3 px-8 rounded-full text-lg"
            >
              Falar com Especialista
            </Link>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex items-center">
              <div className="mr-3 bg-white/20 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-white/80 text-sm">Consultas online</span>
                <span className="font-semibold">Segunda a Sábado</span>
              </div>
            </div>
            
            <Link 
              to="/faq" 
              className="inline-flex items-center text-white/90 hover:text-white font-medium"
            >
              Dúvidas frequentes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
