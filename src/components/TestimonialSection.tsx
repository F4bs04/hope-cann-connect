
import React from 'react';
import { User, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "O tratamento com cannabis medicinal transformou completamente minha qualidade de vida. Finalmente consigo dormir bem após anos de insônia.",
    author: "Maria S.",
    condition: "Insônia Crônica"
  },
  {
    quote: "Depois de tentar diversos tratamentos para minha ansiedade, encontrei na HopeCann uma abordagem que realmente funciona para mim.",
    author: "Carlos R.",
    condition: "Transtorno de Ansiedade"
  },
  {
    quote: "A equipe médica da HopeCann é extremamente atenciosa e profissional. Me senti acolhido desde a primeira consulta.",
    author: "Ana L.",
    condition: "Dor Crônica"
  }
];

const TestimonialSection = () => {
  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="hopecann-container">
        <h2 className="hopecann-section-title">O que nossos pacientes dizem</h2>
        <p className="hopecann-section-subtitle">
          Conheça histórias reais de pessoas que tiveram suas vidas transformadas através do tratamento canábico
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="hopecann-card flex flex-col">
              <div className="mb-4 text-hopecann-teal">
                <Quote className="h-10 w-10 opacity-70" />
              </div>
              <p className="text-gray-700 italic mb-6 flex-grow">"{testimonial.quote}"</p>
              <div className="flex items-center mt-auto">
                <div className="bg-hopecann-teal/10 p-3 rounded-full mr-4">
                  <User className="h-6 w-6 text-hopecann-teal" />
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.condition}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
