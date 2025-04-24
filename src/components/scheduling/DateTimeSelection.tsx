
import React from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <CalendarIcon className="text-hopecann-teal" />
        Escolha a Data e Horário
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Calendar */}
        <div className="bg-white p-4 rounded-lg border">
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={(date) => date && setSelectedDate(date)}
            disabled={{ before: addDays(new Date(), 1) }}
            locale={ptBR}
            className={cn("p-3 pointer-events-auto")}
            fromMonth={new Date()}
            toMonth={addDays(new Date(), 60)}
          />
        </div>
        
        {/* Right column: Time slots */}
        <div>
          <div className="bg-white p-4 rounded-lg border h-full">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-hopecann-teal" />
              Horários Disponíveis
            </h3>
            
            {selectedDate ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "p-2 rounded-lg text-center transition-colors",
                      selectedTime === time 
                        ? "bg-hopecann-teal text-white" 
                        : "border hover:border-hopecann-teal/50"
                    )}
                  >
                    {time}
                  </button>
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
      
      <div className="flex justify-between pt-4">
        <button
          className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        
        <button
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-full",
            "bg-hopecann-teal text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          onClick={onNext}
          disabled={!selectedDate || !selectedTime}
        >
          Confirmar Horário
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default DateTimeSelection;
