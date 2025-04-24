
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Puzzle, Zap, Activity, Hand, HelpCircle } from 'lucide-react';

const conditions = [
  {
    title: "Ansiedade e Depressão",
    description: "Tratamento eficaz para sintomas de ansiedade e depressão com medicamentos canábicos.",
    icon: Brain
  },
  {
    title: "Autismo",
    description: "Auxílio no tratamento de sintomas do espectro autista.",
    icon: Puzzle
  },
  {
    title: "Epilepsia",
    description: "Controle de convulsões e gestão de sintomas epilépticos.",
    icon: Zap
  },
  {
    title: "Fibromialgia",
    description: "Alívio das dores crônicas e sintomas da fibromialgia.",
    icon: Activity
  },
  {
    title: "Parkinson",
    description: "Tratamento complementar para sintomas do Parkinson.",
    icon: Hand
  },
  {
    title: "Alzheimer",
    description: "Suporte no tratamento de sintomas do Alzheimer.",
    icon: HelpCircle
  }
];

const MedicalConditionsSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="hopecann-container">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-hopecann-green">
          Principais condições médicas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {conditions.map((condition, index) => (
            <Card key={index} className="overflow-hidden transition-all hover:shadow-lg border-green-100">
              <div className="relative h-48 bg-gray-200">
                <img
                  src="/lovable-uploads/83dc9ade-cea8-47db-99de-498db4ce2767.png"
                  alt={condition.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <condition.icon className="w-6 h-6 text-hopecann-teal" />
                  <h3 className="text-xl font-semibold text-hopecann-green">{condition.title}</h3>
                </div>
                <p className="text-gray-600">{condition.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MedicalConditionsSection;
