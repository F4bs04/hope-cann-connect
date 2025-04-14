
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateAvailableDays } from './utils/dateUtils';

interface DateTimeStepProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DateTimeStep: React.FC<DateTimeStepProps> = ({
  selectedDate,
  selectedTime,
  setSelectedDate,
  setSelectedTime,
  onNext,
  onBack
}) => {
  // Generate available days for selection
  const availableDays = generateAvailableDays();
  
  // Time slots available for selection
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Calendar className="text-hopecann-teal" />
        Escolha a Data e Horário
      </h2>
      
      <div className="mb-8">
        <h3 className="font-medium mb-3">Data da Consulta</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-8">
          {availableDays.map((date, index) => (
            <div 
              key={index}
              className={`p-3 border rounded-lg cursor-pointer transition-colors text-center ${
                selectedDate && selectedDate.getTime() === date.getTime() 
                  ? 'border-hopecann-teal bg-hopecann-teal/5' 
                  : 'border-gray-200 hover:border-hopecann-teal/50'
              }`}
              onClick={() => setSelectedDate(date)}
            >
              <p className="text-sm text-gray-500">{format(date, 'E', { locale: ptBR })}</p>
              <p className="font-medium">{format(date, 'dd')}</p>
              <p className="text-sm">{format(date, 'MMM', { locale: ptBR })}</p>
            </div>
          ))}
        </div>
        
        {selectedDate && (
          <>
            <h3 className="font-medium mb-3">Horário Disponível</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {timeSlots.map((time, index) => (
                <div 
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors text-center flex items-center justify-center gap-2 ${
                    selectedTime === time 
                      ? 'border-hopecann-teal bg-hopecann-teal/5' 
                      : 'border-gray-200 hover:border-hopecann-teal/50'
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  <Clock size={16} />
                  <span>{time}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="flex justify-between">
        <button
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-50"
          onClick={onBack}
        >
          Voltar
        </button>
        <button
          className="bg-hopecann-teal text-white px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNext}
          disabled={!selectedDate || !selectedTime}
        >
          Próximo
        </button>
      </div>
    </div>
  );
};
