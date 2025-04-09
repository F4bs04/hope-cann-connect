
import React from 'react';
import { LucideIcon, Leaf, Heart, Clock, Shield, Sparkles, Check } from 'lucide-react';

interface BenefitProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const benefits: BenefitProps[] = [
  {
    title: "Tratamento Natural",
    description: "Abordagem terapêutica baseada em compostos naturais com eficácia comprovada cientificamente.",
    icon: Leaf
  },
  {
    title: "Atendimento Humanizado",
    description: "Equipe médica especializada com foco no cuidado individualizado e acolhedor.",
    icon: Heart
  },
  {
    title: "Acompanhamento Contínuo",
    description: "Suporte médico constante durante todo o processo de tratamento e ajustes necessários.",
    icon: Clock
  },
  {
    title: "Segurança e Legalidade",
    description: "Tratamentos dentro da regulamentação da ANVISA, com qualidade e procedência garantidas.",
    icon: Shield
  }
];

const BenefitCard = ({ title, description, icon: Icon }: BenefitProps) => {
  return (
    <div className="hopecann-card flex flex-col items-start p-8">
      <div className="bg-hopecann-teal/10 p-4 rounded-xl mb-6">
        <Icon className="h-8 w-8 text-hopecann-teal" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const BenefitsSection = () => {
  return (
    <section className="hopecann-section">
      <div className="hopecann-container">
        <h2 className="hopecann-section-title">Benefícios do Tratamento Canábico</h2>
        <p className="hopecann-section-subtitle">
          Descubra como a medicina canábica pode oferecer novas possibilidades para sua saúde e bem-estar
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-12">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              title={benefit.title}
              description={benefit.description}
              icon={benefit.icon}
            />
          ))}
        </div>
        
        <div className="mt-16 bg-hopecann-teal/5 p-8 rounded-2xl border border-hopecann-teal/20">
          <h3 className="text-2xl font-semibold mb-6 text-center">Por que escolher o tratamento canábico?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Redução de efeitos colaterais comparado a medicamentos tradicionais",
              "Tratamento personalizado de acordo com suas necessidades específicas",
              "Opção para pacientes que não responderam a terapias convencionais",
              "Potencial melhora na qualidade de vida e bem-estar geral"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1 bg-hopecann-teal rounded-full p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
