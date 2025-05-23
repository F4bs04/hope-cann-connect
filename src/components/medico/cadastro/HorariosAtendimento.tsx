
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

interface DiaHorario {
  dia: string;
  horaInicio: string;
  horaFim: string;
}

export const diasSemana = [
  { value: "segunda", label: "Segunda-feira" },
  { value: "terca", label: "Terça-feira" },
  { value: "quarta", label: "Quarta-feira" },
  { value: "quinta", label: "Quinta-feira" },
  { value: "sexta", label: "Sexta-feira" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

interface HorariosAtendimentoProps {
  horarios: DiaHorario[];
  setHorarios: React.Dispatch<React.SetStateAction<DiaHorario[]>>;
}

const HorariosAtendimento = ({ horarios, setHorarios }: HorariosAtendimentoProps) => {
  const { toast } = useToast();
  const [diaAtual, setDiaAtual] = useState<string>("");
  const [horaInicio, setHoraInicio] = useState<string>("");
  const [horaFim, setHoraFim] = useState<string>("");

  const addHorario = () => {
    if (!diaAtual || !horaInicio || !horaFim) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Preencha todos os campos do horário",
      });
      return;
    }

    // Check if time is valid
    if (horaInicio >= horaFim) {
      toast({
        variant: "destructive",
        title: "Horário inválido",
        description: "A hora de início deve ser antes da hora de fim",
      });
      return;
    }

    // Check if overlapping with existing hours for the same day
    const overlapping = horarios.some(h => 
      h.dia === diaAtual && 
      ((horaInicio >= h.horaInicio && horaInicio < h.horaFim) || 
       (horaFim > h.horaInicio && horaFim <= h.horaFim) ||
       (horaInicio <= h.horaInicio && horaFim >= h.horaFim))
    );

    if (overlapping) {
      toast({
        variant: "destructive",
        title: "Horário sobreposto",
        description: "Este horário se sobrepõe a outro já adicionado no mesmo dia",
      });
      return;
    }

    setHorarios([...horarios, { dia: diaAtual, horaInicio, horaFim }]);
    setDiaAtual("");
    setHoraInicio("");
    setHoraFim("");
  };

  const removeHorario = (index: number) => {
    const newHorarios = [...horarios];
    newHorarios.splice(index, 1);
    setHorarios(newHorarios);
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="font-medium text-lg mb-4">Horários de atendimento</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Dia da semana</label>
          <Select value={diaAtual} onValueChange={setDiaAtual}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o dia" />
            </SelectTrigger>
            <SelectContent>
              {diasSemana.map((dia) => (
                <SelectItem key={dia.value} value={dia.value}>
                  {dia.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Hora de início</label>
          <Input 
            type="time" 
            value={horaInicio} 
            onChange={(e) => setHoraInicio(e.target.value)} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Hora de término</label>
          <Input 
            type="time" 
            value={horaFim} 
            onChange={(e) => setHoraFim(e.target.value)} 
          />
        </div>
      </div>
      
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={addHorario}
      >
        <Plus size={16} />
        Adicionar horário
      </Button>
      
      {horarios.length > 0 && (
        <div className="mt-4 border rounded-md p-2">
          <h4 className="font-medium mb-2">Horários adicionados:</h4>
          <ul className="space-y-2">
            {horarios.map((horario, index) => {
              const diaLabel = diasSemana.find(d => d.value === horario.dia)?.label;
              return (
                <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>
                    {diaLabel} - {horario.horaInicio} até {horario.horaFim}
                  </span>
                  <button
                    type="button"
                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                    onClick={() => removeHorario(index)}
                  >
                    <X size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {horarios.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">
          Adicione pelo menos um horário de atendimento.
        </p>
      )}
    </div>
  );
};

export default HorariosAtendimento;
