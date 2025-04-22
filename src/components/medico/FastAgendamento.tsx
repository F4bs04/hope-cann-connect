
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarClock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FastAgendamentoProps {
  consultationDuration: string;
  onAgendamentoRapido: (data: { dia: Date; horario: string }) => void;
}

const FastAgendamento: React.FC<FastAgendamentoProps> = ({
  consultationDuration,
  onAgendamentoRapido
}) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const horarios = [];
  for (let hora = 8; hora < 18; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      horarios.push(
        `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`
      );
    }
  }

  const handleConfirmar = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Erro",
        description: "Selecione uma data e horário para continuar",
        variant: "destructive",
      });
      return;
    }

    onAgendamentoRapido({
      dia: selectedDate,
      horario: selectedTime
    });

    setIsDialogOpen(false);
    setSelectedDate(undefined);
    setSelectedTime(undefined);

    toast({
      title: "Agendamento rápido realizado",
      description: `Consulta agendada para ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às ${selectedTime}`,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarClock className="h-4 w-4" />
          Agendamento Rápido
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Agendamento Rápido</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm font-medium mb-2">Selecione o dia</p>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="rounded-md border"
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Selecione o horário inicial</p>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {horarios.map((horario) => (
                  <SelectItem key={horario} value={horario}>
                    {horario}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDate && selectedTime && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium">Resumo do agendamento:</p>
              <p className="text-sm">
                Data: {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <p className="text-sm">
                Horário: {selectedTime} - {consultationDuration} minutos
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmar}>
              Confirmar Agendamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FastAgendamento;
