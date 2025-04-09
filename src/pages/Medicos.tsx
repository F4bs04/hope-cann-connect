
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, Phone, Mail, Award, BookOpen, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

const doctorsData = [
  {
    name: "Dr. Ricardo Silva",
    specialty: "Neurologista",
    photo: "/lovable-uploads/12b5d4e6-afb3-43a3-9045-b53345c241b6.png",
    bio: "Especialista em tratamentos canábicos para distúrbios neurológicos, com mais de 15 anos de experiência clínica. Formado pela USP com residência em Neurologia pela UNIFESP.",
    credentials: [
      "Membro da Sociedade Brasileira de Neurologia",
      "Especialização em Canabinoides e Sistema Nervoso",
      "Pesquisador na área de epilepsia refratária"
    ],
    quote: "Acredito no poder da medicina canábica como uma alternativa eficaz para pacientes que não respondem aos tratamentos convencionais."
  },
  {
    name: "Dra. Ana Santos",
    specialty: "Psiquiatra",
    photo: "/lovable-uploads/5601622e-b421-4257-8c29-4be5a45ae10f.png",
    bio: "Especializada em tratamentos para ansiedade e depressão com abordagem integrativa. Formada pela UFRJ com residência em Psiquiatria pelo Instituto de Psiquiatria da USP.",
    credentials: [
      "Membro da Associação Brasileira de Psiquiatria",
      "Mestrado em Neurociências",
      "Especialização em Cannabis Medicinal para Transtornos Mentais"
    ],
    quote: "Minha abordagem combina a psiquiatria tradicional com os avanços da medicina canábica, buscando sempre o melhor resultado para cada paciente."
  },
  {
    name: "Dr. Carlos Mendes",
    specialty: "Neurologista",
    photo: "/lovable-uploads/31b21e55-c292-47fb-888b-f884e7027019.png",
    bio: "Especialista em epilepsia e doenças neurodegenerativas, com foco em tratamentos inovadores. Formado pela UNICAMP com doutorado em Neurologia Clínica.",
    credentials: [
      "Membro da Academia Brasileira de Neurologia",
      "Pesquisador clínico em canabinoides para doenças neurológicas",
      "Coordenador do Centro de Tratamento Avançado em Epilepsia"
    ],
    quote: "Vejo diariamente como o tratamento canábico pode transformar a vida de pacientes com condições neurológicas complexas."
  },
  {
    name: "Dra. Mariana Costa",
    specialty: "Clínica Geral",
    photo: "/lovable-uploads/906d320d-17b6-4919-8bd3-30ecf3d226e7.png",
    bio: "Médica com foco em medicina integrativa e tratamentos personalizados para dor crônica. Formada pela UFMG com especialização em Cannabis Medicinal.",
    credentials: [
      "Certificação Internacional em Endocanabinologia",
      "Especialista em Dor Crônica",
      "Membro da Sociedade Brasileira para Estudo da Dor"
    ],
    quote: "A cannabis medicinal não é uma solução mágica, mas quando bem prescrita, pode trazer qualidade de vida para muitos pacientes."
  }
];

const Medicos = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Banner Principal */}
        <section className="bg-hopecann-teal/10 py-16">
          <div className="hopecann-container">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Nossa Equipe Médica</h1>
            <p className="text-xl text-center text-gray-700 max-w-3xl mx-auto mb-8">
              Conheça os especialistas que estão revolucionando vidas através do tratamento canábico personalizado e humanizado
            </p>
          </div>
        </section>
        
        {/* Equipe médica detalhada */}
        <section className="py-16">
          <div className="hopecann-container">
            <div className="space-y-16">
              {doctorsData.map((doctor, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col lg:flex-row">
                  <div className="lg:w-1/3 h-80 lg:h-auto">
                    <img 
                      src={doctor.photo} 
                      alt={doctor.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-8 lg:w-2/3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">{doctor.name}</h2>
                        <p className="text-hopecann-teal">{doctor.specialty}</p>
                      </div>
                      <Link 
                        to="/agendar" 
                        className="inline-flex items-center gap-2 bg-hopecann-teal text-white hover:bg-hopecann-teal/90 px-5 py-2 rounded-full transition-colors"
                      >
                        <Calendar size={18} />
                        <span>Agendar Consulta</span>
                      </Link>
                    </div>
                    
                    <p className="text-gray-700 mb-6">
                      {doctor.bio}
                    </p>
                    
                    <blockquote className="border-l-4 border-hopecann-teal pl-4 italic text-gray-600 mb-6">
                      "{doctor.quote}"
                    </blockquote>
                    
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Award size={20} className="text-hopecann-teal" />
                      Credenciais e Especializações
                    </h3>
                    
                    <ul className="space-y-2 mb-6">
                      {doctor.credentials.map((credential, credIndex) => (
                        <li key={credIndex} className="flex items-start gap-2">
                          <BookOpen size={18} className="text-hopecann-teal mt-1 flex-shrink-0" />
                          <span>{credential}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Chamada para ação */}
        <section className="bg-gray-50 py-16">
          <div className="hopecann-container text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Receba o Cuidado que Você Merece</h2>
              <p className="text-xl text-gray-700 mb-8">
                Nossa equipe médica especializada está pronta para oferecer uma avaliação personalizada e um plano de tratamento adequado às suas necessidades.
              </p>
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                <Link 
                  to="/agendar" 
                  className="inline-flex items-center justify-center gap-2 bg-hopecann-teal text-white hover:bg-hopecann-teal/90 px-8 py-3 rounded-full transition-colors text-lg"
                >
                  <Calendar size={20} />
                  <span>Agendar Consulta</span>
                </Link>
                <Link 
                  to="/contato" 
                  className="inline-flex items-center justify-center gap-2 bg-white border border-hopecann-teal text-hopecann-teal hover:bg-hopecann-teal/5 px-8 py-3 rounded-full transition-colors text-lg"
                >
                  <Mail size={20} />
                  <span>Fale Conosco</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Medicos;
