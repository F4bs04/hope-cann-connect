
import React from 'react';
import { Link } from 'react-router-dom';

const CtaSection = () => {
  return (
    <section className="hopecann-section bg-hopecann-teal text-white py-16">
      <div className="hopecann-container text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Comece Seu Tratamento Hoje</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto text-white/90">
          Agende uma consulta online com nossos especialistas e descubra como o tratamento canábico pode ajudar você.
        </p>
        <Link 
          to="/agendar" 
          className="inline-block bg-white text-hopecann-teal hover:bg-white/90 font-medium py-3 px-8 rounded-full text-lg transition-colors"
        >
          Agendar Primeira Consulta
        </Link>
      </div>
    </section>
  );
};

export default CtaSection;
