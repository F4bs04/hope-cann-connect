
import React from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";

interface DateTimeSelectionProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
  doctorId?: number | null;
}

const DateTimeSelection = ({ 
  selectedDate, 
  selectedTime, 
  setSelectedDate, 
  setSelectedTime,
  onNext,
  onBack,
  doctorId
}: DateTimeSelectionProps) => {
  const { timeSlots, loading: slotsLoading } = useAvailableTimeSlots(doctorId, selectedDate);
  
  return (
    <div className="space-y-6 bg-background p-6 rounded-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
          <CalendarIcon className="text-primary" />
          Escolha a Data e Horário
        </h2>
        <p className="text-muted-foreground">Selecione o dia e o horário ideal para sua consulta</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: Calendar */}
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-4 text-lg">Calendário</h3>
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={(date) => date && setSelectedDate(date)}
            disabled={{ before: addDays(new Date(), 1) }}
            locale={ptBR}
            className={cn("w-full pointer-events-auto")}
            fromMonth={new Date()}
            toMonth={addDays(new Date(), 60)}
            classNames={{
              day_selected: "bg-primary text-primary-foreground hover:bg-primary/90",
              day_today: "bg-accent text-accent-foreground font-semibold",
              button: "h-9 w-9 text-sm",
            }}
          />
        </div>
        
        {/* Right column: Time slots */}
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Horários Disponíveis
          </h3>
          
          {selectedDate ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              {slotsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      disabled={!slot.available}
                      className={cn(
                        "w-full h-12 text-sm font-medium transition-all duration-200",
                        selectedTime === slot.time 
                          ? "bg-primary text-primary-foreground shadow-md scale-105" 
                          : slot.available 
                            ? "hover:bg-secondary hover:scale-105" 
                            : "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {slot.time}
                      {!slot.available && (
                        <span className="text-xs ml-1">(ocupado)</span>
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Selecione uma data no calendário para ver os horários disponíveis
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 px-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!selectedDate || !selectedTime}
          className={cn(
            "flex items-center gap-2 px-6",
            "bg-primary hover:bg-primary/90 disabled:opacity-50"
          )}
        >
          Confirmar Horário
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DateTimeSelection;
