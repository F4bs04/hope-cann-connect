
import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, SunMedium, Sunset, CalendarCheck, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeeklyCalendarViewProps {
  selectedWeekStart: Date;
  prevWeek: () => void;
  nextWeek: () => void;
  renderDaysOfWeek: () => React.ReactNode;
  renderBulkActions: () => React.ReactNode;
  horariosConfig: Record<string, string[]>;
  formatWeekday: (date: Date) => string;
  handleQuickSetMode: (mode: 'morning' | 'afternoon' | 'all' | 'custom') => void;
  applyPatternToWeek: (pattern: 'workdays' | 'weekend' | 'all' | 'none', timePattern: 'morning' | 'afternoon' | 'all' | 'none') => void;
  saveAvailability: () => Promise<boolean>;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  selectedWeekStart,
  prevWeek,
  nextWeek,
  renderDaysOfWeek,
  horariosConfig,
  formatWeekday,
  handleQuickSetMode,
  applyPatternToWeek,
  saveAvailability
}) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAvailability = async () => {
    setIsSaving(true);
    try {
      await saveAvailability();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Configuration Panel */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
        <h3 className="text-sm font-medium text-blue-700 mb-3">Configuração Rápida</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-blue-700 mb-2">Aplicar a:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs"
                onClick={() => applyPatternToWeek('workdays', 'all')}
              >
                Dias úteis
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs"
                onClick={() => applyPatternToWeek('weekend', 'all')}
              >
                Fim de semana
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs"
                onClick={() => applyPatternToWeek('all', 'all')}
              >
                Semana toda
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-blue-700 mb-2">Definir como:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs flex items-center gap-1"
                onClick={() => {
                  handleQuickSetMode('morning');
                  applyPatternToWeek('all', 'morning');
                }}
              >
                <SunMedium className="h-3 w-3" />
                Manhãs
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs flex items-center gap-1"
                onClick={() => {
                  handleQuickSetMode('afternoon');
                  applyPatternToWeek('all', 'afternoon');
                }}
              >
                <Sunset className="h-3 w-3" />
                Tardes
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="h-8 text-xs flex items-center gap-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  handleQuickSetMode('all');
                  applyPatternToWeek('all', 'all');
                }}
              >
                <CalendarCheck className="h-3 w-3" />
                Dia todo
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => applyPatternToWeek('all', 'none')}
              >
                <XCircle className="h-3 w-3" />
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={prevWeek} className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Semana anterior
        </Button>
        <span className="text-sm font-medium">
          {format(selectedWeekStart, "dd/MM")} - {format(addDays(selectedWeekStart, 6), "dd/MM/yyyy")}
        </span>
        <Button variant="outline" size="sm" onClick={nextWeek} className="flex items-center gap-1">
          Próxima semana
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2">
        {renderDaysOfWeek()}
      </div>
      
      {/* Save Button */}
      <div className="pt-4 border-t mt-4">
        <Button 
          variant="default" 
          className="w-full flex items-center justify-center bg-hopecann-teal hover:bg-hopecann-teal/90"
          onClick={handleSaveAvailability}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar informações'}
        </Button>
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
