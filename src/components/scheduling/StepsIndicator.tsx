
import React from 'react';
import { User, Calendar, FileText, Check } from 'lucide-react';

interface StepsIndicatorProps {
  currentStep: number;
}

const StepsIndicator = ({ currentStep }: StepsIndicatorProps) => {
  const steps = [
    { number: 1, name: 'Especialista', icon: User },
    { number: 2, name: 'Data e Hora', icon: Calendar },
    { number: 3, name: 'Dados', icon: FileText },
    { number: 4, name: 'Confirmação', icon: Check }
  ];
  
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center w-full max-w-3xl mx-auto relative">
        <div className="absolute top-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
        
        {steps.map((step) => {
          const StepIcon = step.icon;
          return (
            <div key={step.number} className="flex flex-col items-center">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentStep >= step.number ? 'bg-hopecann-teal text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                <StepIcon size={20} />
              </div>
              <span className={`text-xs mt-2 ${currentStep >= step.number ? 'text-hopecann-teal font-medium' : 'text-gray-500'}`}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepsIndicator;
