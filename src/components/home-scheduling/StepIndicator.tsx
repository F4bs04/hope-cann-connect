
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center w-full max-w-3xl mx-auto relative">
        <div className="absolute top-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
        
        {[1, 2, 3, 4, 5].map((stepNumber) => (
          <div key={stepNumber} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= stepNumber ? 'bg-hopecann-teal text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {stepNumber}
            </div>
            <span className={`text-xs mt-2 ${currentStep >= stepNumber ? 'text-hopecann-teal' : 'text-gray-500'}`}>
              {
                stepNumber === 1 ? 'Especialista' :
                stepNumber === 2 ? 'Data e Hora' :
                stepNumber === 3 ? 'Pagamento' :
                stepNumber === 4 ? 'Dados' : 'Confirmação'
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
