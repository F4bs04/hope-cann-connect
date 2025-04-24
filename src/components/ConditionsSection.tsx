
import React from 'react';
import { Brain, Puzzle, Zap, Activity, Hand, HelpCircle } from 'lucide-react';

const conditionsData = [
  {
    title: 'Ansiedade e Depressão',
    description: 'Tratamento eficaz para sintomas de ansiedade e depressão com medicamentos canábicos.',
    icon: Brain
  }, 
  {
    title: 'Autismo',
    description: 'Auxílio no tratamento de sintomas do espectro autista.',
    icon: Puzzle
  }, 
  {
    title: 'Epilepsia',
    description: 'Controle de convulsões e gestão de sintomas epilépticos.',
    icon: Zap
  }, 
  {
    title: 'Fibromialgia',
    description: 'Alívio das dores crônicas e sintomas da fibromialgia.',
    icon: Activity
  }, 
  {
    title: 'Parkinson',
    description: 'Tratamento complementar para sintomas do Parkinson.',
    icon: Hand
  }, 
  {
    title: 'Alzheimer',
    description: 'Suporte no tratamento de sintomas do Alzheimer.',
    icon: HelpCircle
  }
];

const ConditionCard = ({
  title,
  description,
  icon: Icon
}) => {
  return (
    <div className="hopecann-card flex flex-col items-center text-center">
      <div className="bg-hopecann-teal/10 p-4 rounded-full mb-4">
        <Icon className="h-8 w-8 text-hopecann-teal" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const ConditionsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="hopecann-container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-hopecann-green">Condições tratadas com Cannabis Medicinal</h2>
          <p className="text-lg text-gray-600">
            A cannabis medicinal tem se mostrado eficaz no tratamento de diversas condições médicas.
            Conheça as principais aplicações terapêuticas:
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {conditionsData.map((condition, index) => (
            <ConditionCard
              key={index}
              title={condition.title}
              description={condition.description}
              icon={condition.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConditionsSection;
