
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
        <div className="bg-card p-6 rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
          <h3 className="font-bold mb-4 text-xl text-primary flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            Calendário
          </h3>
          <div className="flex-1 flex items-center justify-center">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setSelectedTime(null); // Reset selected time when date changes
                }
              }}
              disabled={{ before: new Date() }}
              locale={ptBR}
              className={cn("w-full pointer-events-auto h-full flex flex-col justify-center")}
              fromMonth={new Date()}
              toMonth={addDays(new Date(), 60)}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
                month: "space-y-4 flex-1 flex flex-col",
                table: "w-full border-collapse flex-1",
                head_row: "flex mb-2",
                head_cell: "text-foreground rounded-md w-full font-semibold text-sm flex-1 text-center p-3",
                row: "flex w-full mt-2",
                cell: "h-14 w-full text-center text-sm p-1 relative flex-1 focus-within:relative focus-within:z-20",
                day: "h-12 w-full p-0 font-medium hover:border-2 hover:border-primary hover:bg-transparent transition-all duration-200 rounded-lg text-base",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg border-0",
                day_today: "bg-accent text-accent-foreground font-bold border border-primary/50 rounded-lg",
                day_outside: "text-muted-foreground/70 opacity-60",
                day_disabled: "text-muted-foreground/50 opacity-40",
                nav_button: "h-10 w-10 hover:bg-secondary transition-colors rounded-md",
                nav_button_previous: "hover:scale-110 transition-transform",
                nav_button_next: "hover:scale-110 transition-transform",
              }}
            />
          </div>
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
