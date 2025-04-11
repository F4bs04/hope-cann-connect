
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface HorarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDay: Date | null;
  onRemoveHorario: (day: Date, time: string) => void;
  onAddHorario: (day: Date, time: string) => void;
  getHorariosConfig: (day: Date) => string[];
  horariosDisponiveis: {
    manha: string[];
    tarde: string[];
  };
}

const HorarioDialog: React.FC<HorarioDialogProps> = ({
  open,
  onOpenChange,
  selectedDay,
  onRemoveHorario,
  onAddHorario,
  getHorariosConfig,
  horariosDisponiveis
}) => {
  if (!selectedDay) return null;
  
  const selectedDayHorarios = getHorariosConfig(selectedDay);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Horários</DialogTitle>
          <DialogDescription>
            <span>Horários para {format(selectedDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Horários da manhã</h4>
            <div className="grid grid-cols-3 gap-2">
              {horariosDisponiveis.manha.map(hora => {
                const isSelected = selectedDayHorarios.includes(hora);
                
                return (
                  <Button 
                    key={hora} 
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className={isSelected ? 'bg-green-600' : ''}
                    onClick={() => {
                      if (isSelected) {
                        onRemoveHorario(selectedDay, hora);
                      } else {
                        onAddHorario(selectedDay, hora);
                      }
                    }}
                  >
                    {hora}
                    {isSelected && <Check className="ml-1 h-4 w-4" />}
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Horários da tarde</h4>
            <div className="grid grid-cols-3 gap-2">
              {horariosDisponiveis.tarde.map(hora => {
                const isSelected = selectedDayHorarios.includes(hora);
                
                return (
                  <Button 
                    key={hora} 
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className={isSelected ? 'bg-green-600' : ''}
                    onClick={() => {
                      if (isSelected) {
                        onRemoveHorario(selectedDay, hora);
                      } else {
                        onAddHorario(selectedDay, hora);
                      }
                    }}
                  >
                    {hora}
                    {isSelected && <Check className="ml-1 h-4 w-4" />}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HorarioDialog;
