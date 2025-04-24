import React from 'react';
import { Brain, Puzzle, Zap, Activity, Hand, HelpCircle } from 'lucide-react';
const conditionsData = [{
  title: 'Ansiedade e Depressão',
  description: 'Tratamento eficaz para sintomas de ansiedade e depressão com medicamentos canábicos.',
  icon: Brain
}, {
  title: 'Autismo',
  description: 'Auxílio no tratamento de sintomas do espectro autista.',
  icon: Puzzle
}, {
  title: 'Epilepsia',
  description: 'Controle de convulsões e gestão de sintomas epilépticos.',
  icon: Zap
}, {
  title: 'Fibromialgia',
  description: 'Alívio das dores crônicas e sintomas da fibromialgia.',
  icon: Activity
}, {
  title: 'Parkinson',
  description: 'Tratamento complementar para sintomas do Parkinson.',
  icon: Hand
}, {
  title: 'Alzheimer',
  description: 'Suporte no tratamento de sintomas do Alzheimer.',
  icon: HelpCircle
}];
const ConditionCard = ({
  title,
  description,
  icon: Icon
}) => {
  return <div className="hopecann-card flex flex-col items-center text-center">
      <div className="bg-hopecann-teal/10 p-4 rounded-full mb-4">
        <Icon className="h-8 w-8 text-hopecann-teal" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>;
};
const ConditionsSection = () => {
  return;
};
export default ConditionsSection;