import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Brain, Heart, Activity, Zap, UserCircle, FileText, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const conditionCategories = [
  {
    title: "Condições Neurológicas",
    icon: Brain,
    conditions: [
      {
        name: "Epilepsia",
        description: "Pesquisas mostram que o CBD pode reduzir significativamente a frequência e intensidade das crises epilépticas, especialmente em pacientes resistentes a medicamentos tradicionais."
      },
      {
        name: "Doença de Parkinson",
        description: "Estudos indicam que o tratamento canábico pode ajudar a reduzir tremores, rigidez muscular e melhorar a qualidade de vida dos pacientes."
      },
      {
        name: "Alzheimer",
        description: "Compostos da cannabis podem atuar como neuroprotetores e ajudar a reduzir a inflamação cerebral associada à doença de Alzheimer."
      }
    ]
  },
  {
    title: "Saúde Mental",
    icon: UserCircle,
    conditions: [
      {
        name: "Ansiedade",
        description: "O CBD tem mostrado resultados promissores no controle da ansiedade, ajudando a diminuir sintomas sem os efeitos colaterais de medicamentos ansiolíticos tradicionais."
      },
      {
        name: "Depressão",
        description: "Estudos apontam que canabinoides podem ter efeitos antidepressivos, auxiliando pacientes que não tiveram sucesso com terapias convencionais."
      },
      {
        name: "Insônia",
        description: "A cannabis medicinal pode ajudar a regular o ciclo do sono, sendo uma alternativa natural para quem sofre com distúrbios do sono."
      },
      {
        name: "Transtorno do Espectro Autista",
        description: "Pesquisas indicam melhora em comportamentos repetitivos, ansiedade e habilidades sociais em pacientes com autismo."
      }
    ]
  },
  {
    title: "Dor e Inflamação",
    icon: Activity,
    conditions: [
      {
        name: "Dor Crônica",
        description: "Canabinoides podem atuar nos receptores do sistema endocanabinoide, ajudando a reduzir dores persistentes de diferentes origens."
      },
      {
        name: "Fibromialgia",
        description: "O tratamento canábico tem mostrado benefícios para pacientes com fibromialgia, proporcionando alívio da dor, melhor qualidade do sono e redução da fadiga."
      },
      {
        name: "Artrite",
        description: "Propriedades anti-inflamatórias da cannabis podem ajudar a reduzir a inflamação e dor associadas à artrite."
      }
    ]
  },
  {
    title: "Outras Condições",
    icon: FileText,
    conditions: [
      {
        name: "Câncer (controle de sintomas)",
        description: "A cannabis medicinal pode auxiliar no alívio de sintomas como náuseas, vômitos e dor decorrentes do tratamento oncológico."
      },
      {
        name: "Doença de Crohn",
        description: "Estudos indicam que compostos da cannabis podem reduzir a inflamação intestinal e melhorar a qualidade de vida dos pacientes."
      },
      {
        name: "Esclerose Múltipla",
        description: "Tratamentos canábicos podem reduzir a espasticidade muscular e dor neuropática em pacientes com esclerose múltipla."
      }
    ]
  }
];

const Tratamentos = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Banner Principal */}
        <section className="relative py-20 bg-gradient-to-r from-hopecann-teal to-hopecann-green text-white">
          <div className="page-container-wrapper">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Tratamentos Canábicos Personalizados</h1>
              <p className="text-xl text-white/90 mb-8">
                Nossa abordagem combina a medicina tradicional com os benefícios terapêuticos da cannabis medicinal, oferecendo tratamentos personalizados para diversas condições de saúde.
              </p>
              <Link 
                to="/agendar" 
                className="inline-block bg-white text-hopecann-teal hover:bg-white/90 font-medium py-3 px-8 rounded-full text-lg transition-colors"
              >
                Agende sua Avaliação
              </Link>
            </div>
          </div>
        </section>
        
        {/* Informação sobre cannabis medicinal */}
        <section className="py-16 bg-gray-50">
          <div className="page-container-wrapper">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">O que é a Cannabis Medicinal?</h2>
                <p className="text-gray-700 mb-4">
                  A cannabis medicinal refere-se ao uso de plantas de cannabis e seus componentes para tratar doenças ou condições de saúde. A planta contém mais de 100 canabinoides diferentes, sendo o CBD (canabidiol) e o THC (tetrahidrocanabinol) os mais estudados.
                </p>
                <p className="text-gray-700 mb-4">
                  O CBD não causa efeitos psicoativos e tem demonstrado benefícios para várias condições, incluindo epilepsia, ansiedade e dor crônica. O THC, quando usado em dosagens terapêuticas e controladas, pode ajudar em condições como náuseas, espasmos musculares e estimulação do apetite.
                </p>
                <p className="text-gray-700">
                  Os tratamentos com cannabis medicinal são regulamentados pela ANVISA e devem ser realizados com orientação médica especializada, como a oferecida pelos profissionais da HopeCann.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">Benefícios comprovados cientificamente:</h3>
                <ul className="space-y-3">
                  {[
                    "Redução da frequência de crises epilépticas",
                    "Alívio de dores crônicas e neuropáticas",
                    "Controle da ansiedade e melhora do sono",
                    "Redução de espasmos musculares",
                    "Alívio de náuseas e vômitos (ex: durante quimioterapia)",
                    "Propriedades anti-inflamatórias para diversas condições",
                    "Potencial neuroprotetor"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 text-hopecann-teal">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* Condições tratadas por categoria */}
        <section className="py-20">
          <div className="page-container-wrapper">
            <h2 className="text-3xl font-bold text-center mb-16 sm:text-4xl">Condições Médicas Tratadas</h2>
            
            <div className="space-y-16">
              {conditionCategories.map((category, catIndex) => (
                <div key={catIndex} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="bg-hopecann-teal/10 p-6 flex items-center gap-4 border-b border-hopecann-teal/20">
                    <category.icon className="h-8 w-8 text-hopecann-teal" />
                    <h3 className="text-2xl font-semibold text-gray-800">{category.title}</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.conditions.map((condition, condIndex) => (
                        <div key={condIndex} className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <h4 className="text-xl font-semibold mb-3">{condition.name}</h4>
                          <p className="text-gray-700">{condition.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <p className="text-lg text-gray-700 mb-6">
                Não encontrou sua condição listada? A cannabis medicinal pode beneficiar muitas outras condições de saúde.
              </p>
              <Link 
                to="/contato" 
                className="inline-block bg-hopecann-teal text-white hover:bg-hopecann-teal/90 font-medium py-3 px-8 rounded-full text-lg transition-colors"
              >
                Fale com nossa equipe
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Tratamentos;
