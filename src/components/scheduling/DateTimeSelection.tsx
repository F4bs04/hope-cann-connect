
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
    <div className="space-y-8 bg-gradient-to-br from-background to-secondary/20 p-8 rounded-2xl border shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-3 flex items-center justify-center gap-3">
          <CalendarIcon className="text-primary h-8 w-8" />
          Escolha a Data e Horário
        </h2>
        <p className="text-muted-foreground text-lg">Selecione o dia e o horário ideal para sua consulta</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Left column: Calendar */}
        <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <h3 className="font-bold mb-6 text-xl text-primary flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            Calendário
          </h3>
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
              day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 scale-105 shadow-lg",
              day_today: "bg-accent text-accent-foreground font-bold border-2 border-primary/30",
              button: "h-12 w-12 text-base font-medium hover:bg-secondary transition-all duration-200 hover:scale-110",
              head_cell: "text-muted-foreground font-semibold",
              cell: "text-center p-1",
              nav_button: "h-10 w-10 hover:bg-secondary transition-colors",
              nav_button_previous: "hover:scale-110 transition-transform",
              nav_button_next: "hover:scale-110 transition-transform",
            }}
          />
        </div>
        
        {/* Right column: Time slots */}
        <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300">
          <h3 className="font-bold mb-6 text-xl text-primary flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Horários Disponíveis
          </h3>
          
          {selectedDate ? (
            <div className="space-y-6">
              <div className="bg-secondary/30 p-4 rounded-lg border">
                <p className="text-sm font-medium text-muted-foreground mb-1">Data selecionada:</p>
                <p className="text-lg font-bold text-primary">
                  {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              
              {slotsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Carregando horários...</p>
                  </div>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                  <div className="grid grid-cols-3 gap-3 pr-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        disabled={!slot.available}
                        className={cn(
                          "h-14 text-sm font-bold transition-all duration-300 border-2",
                          selectedTime === slot.time 
                            ? "bg-primary text-primary-foreground shadow-xl scale-110 border-primary animate-pulse" 
                            : slot.available 
                              ? "hover:bg-primary/10 hover:border-primary/50 hover:scale-105 hover:shadow-lg active:scale-95" 
                              : "opacity-40 cursor-not-allowed bg-muted/50 border-muted"
                        )}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-base">{slot.time}</span>
                          {!slot.available && (
                            <span className="text-xs opacity-70">ocupado</span>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="animate-bounce-gentle mb-6">
                <Clock className="h-16 w-16 text-muted-foreground/40 mx-auto" />
              </div>
              <p className="text-muted-foreground text-lg">
                Selecione uma data no calendário para ver os horários disponíveis
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-8 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-3 px-8 py-3 text-base font-medium hover:scale-105 transition-all duration-200 hover:shadow-lg border-2"
        >
          <ChevronLeft className="h-5 w-5" />
          Voltar
        </Button>
        
        <div className="flex items-center gap-4">
          {selectedDate && selectedTime && (
            <div className="text-right animate-fade-in">
              <p className="text-sm text-muted-foreground">Agendamento confirmado para:</p>
              <p className="font-bold text-primary">
                {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às {selectedTime}
              </p>
            </div>
          )}
          
          <Button
            onClick={onNext}
            disabled={!selectedDate || !selectedTime}
            className={cn(
              "flex items-center gap-3 px-8 py-3 text-base font-bold transition-all duration-300 border-2",
              "hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:scale-100",
              selectedDate && selectedTime ? "animate-pulse bg-primary border-primary" : ""
            )}
          >
            Confirmar Horário
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelection;
