
import React from 'react';
import { Quote, Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const testimonials = [
  {
    quote: "O tratamento com cannabis medicinal transformou completamente minha qualidade de vida. Finalmente consigo dormir bem após anos de insônia.",
    author: "Maria S.",
    condition: "Insônia Crônica",
    rating: 5
  },
  {
    quote: "Depois de tentar diversos tratamentos para minha ansiedade, encontrei na HopeCann uma abordagem que realmente funciona para mim.",
    author: "Carlos R.",
    condition: "Transtorno de Ansiedade",
    rating: 5
  },
  {
    quote: "A equipe médica da HopeCann é extremamente atenciosa e profissional. Me senti acolhido desde a primeira consulta.",
    author: "Ana L.",
    condition: "Dor Crônica",
    rating: 5
  }
];

const TestimonialSection = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="hopecann-container">
        <h2 className="hopecann-section-title">Histórias de Sucesso</h2>
        <p className="hopecann-section-subtitle">
          Depoimentos de pacientes que tiveram suas vidas transformadas pelo tratamento canábico
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="hopecann-testimonial-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="mb-4 text-hopecann-teal">
                <Quote className="h-8 w-8 opacity-70" />
              </div>
              <p className="text-gray-700 italic mb-6">{testimonial.quote}</p>
              <div className="flex items-start gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="flex items-center mt-auto pt-4 border-t border-gray-100">
                <div className="bg-hopecann-teal/10 p-3 rounded-full mr-4">
                  <div className="h-8 w-8 bg-hopecann-teal/80 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.author.charAt(0)}
                  </div>
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.condition}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a href="#" className="inline-flex items-center text-hopecann-teal hover:text-hopecann-teal/80 font-medium">
            Ver mais depoimentos
            <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
