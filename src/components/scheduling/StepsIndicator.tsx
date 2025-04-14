
import React from 'react';

interface StepsIndicatorProps {
  currentStep: number;
}

const StepsIndicator = ({ currentStep }: StepsIndicatorProps) => {
  const steps = [
    { number: 1, name: 'Especialista' },
    { number: 2, name: 'Data e Hora' },
    { number: 3, name: 'Dados' },
    { number: 4, name: 'Confirmação' }
  ];
  
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center w-full max-w-3xl mx-auto relative">
        <div className="absolute top-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
        
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= step.number ? 'bg-hopecann-teal text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.number}
            </div>
            <span className={`text-xs mt-2 ${currentStep >= step.number ? 'text-hopecann-teal' : 'text-gray-500'}`}>
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepsIndicator;
