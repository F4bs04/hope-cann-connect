
import React from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";

interface DateTimeSelectionProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const DateTimeSelection = ({ 
  selectedDate, 
  selectedTime, 
  setSelectedDate, 
  setSelectedTime,
  onNext,
  onBack
}: DateTimeSelectionProps) => {
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <CalendarIcon className="text-hopecann-teal" />
        Escolha a Data e Horário
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Left column: Calendar */}
        <div className="md:col-span-2">
          <div className="border rounded-lg p-3 bg-white">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={{ before: addDays(new Date(), 1) }}
              className="w-full"
              locale={ptBR}
              fromMonth={new Date()}
              toMonth={addDays(new Date(), 60)}
            />
          </div>
        </div>
        
        {/* Right column: Time slots */}
        <div>
          <div className="border rounded-lg p-4 bg-white h-full">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Clock size={16} className="text-hopecann-teal" />
              Horários Disponíveis
            </h3>
            
            {selectedDate ? (
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((time, index) => (
                  <div 
                    key={index}
                    className={`p-2 border rounded-lg cursor-pointer transition-colors text-center ${
                      selectedTime === time 
                        ? 'border-hopecann-teal bg-hopecann-teal/5 text-hopecann-teal font-medium' 
                        : 'border-gray-200 hover:border-hopecann-teal/50'
                    }`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Selecione uma data no calendário para ver os horários disponíveis</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-50"
          onClick={onBack}
        >
          <div className="flex items-center gap-2">
            <ChevronLeft size={16} />
            Voltar
          </div>
        </button>
        <button
          className="bg-hopecann-teal text-white px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNext}
          disabled={!selectedDate || !selectedTime}
        >
          <div className="flex items-center gap-2">
            Confirmar Horário
            <ChevronRight size={16} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default DateTimeSelection;
