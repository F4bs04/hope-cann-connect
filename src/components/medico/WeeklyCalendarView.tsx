
import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, SunMedium, Sunset, CalendarCheck, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WeeklyCalendarViewProps {
  selectedWeekStart: Date;
  prevWeek: () => void;
  nextWeek: () => void;
  renderDaysOfWeek: () => React.ReactNode;
  renderBulkActions: () => React.ReactNode;
  horariosConfig: Record<string, string[]>;
  formatWeekday: (date: Date) => string;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  selectedWeekStart,
  prevWeek,
  nextWeek,
  renderDaysOfWeek,
  renderBulkActions,
  horariosConfig,
  formatWeekday
}) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAvailability = async () => {
    setIsSaving(true);
    try {
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Não autorizado",
          description: "Você precisa estar logado para salvar os horários.",
        });
        setIsSaving(false);
        return;
      }

      // Get the doctor's ID from the medicos table
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (userError) {
        throw userError;
      }

      const { data: doctorData, error: doctorError } = await supabase
        .from('medicos')
        .select('id')
        .eq('id_usuario', userData.id)
        .single();

      if (doctorError) {
        throw doctorError;
      }

      const doctorId = doctorData.id;

      // Delete existing schedule entries for the doctor
      await supabase
        .from('horarios_disponiveis')
        .delete()
        .eq('id_medico', doctorId);

      // Insert new schedule entries based on horariosConfig
      const scheduleEntries = [];
      for (const [diaSemana, horarios] of Object.entries(horariosConfig)) {
        if (horarios.length > 0) {
          // Group consecutive hours
          let startHour = horarios[0];
          let endHour = '';
          
          for (let i = 0; i < horarios.length; i++) {
            const currentHour = horarios[i];
            
            // If this is the last hour or there's a gap to the next hour
            if (i === horarios.length - 1 || 
                parseInt(horarios[i+1].split(':')[0]) - parseInt(currentHour.split(':')[0]) > 1) {
              
              // Calculate end hour (current hour + 1)
              const currentHourNum = parseInt(currentHour.split(':')[0]);
              endHour = `${(currentHourNum + 1).toString().padStart(2, '0')}:00`;
              
              // Add entry for this time block
              scheduleEntries.push({
                id_medico: doctorId,
                dia_semana: diaSemana,
                hora_inicio: startHour,
                hora_fim: endHour
              });
              
              // If not the last hour, start a new block with the next hour
              if (i < horarios.length - 1) {
                startHour = horarios[i+1];
              }
            }
          }
        }
      }

      if (scheduleEntries.length > 0) {
        const { error: insertError } = await supabase
          .from('horarios_disponiveis')
          .insert(scheduleEntries);

        if (insertError) {
          throw insertError;
        }
      }

      // Update doctor's availability status
      const { error: statusError } = await supabase
        .from('medicos')
        .update({ status_disponibilidade: true })
        .eq('id', doctorId);

      if (statusError) {
        throw statusError;
      }

      toast({
        title: "Informações salvas",
        description: "Sua disponibilidade foi atualizada com sucesso e já está visível para os pacientes.",
      });
    } catch (error: any) {
      console.error("Erro ao salvar disponibilidade:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar sua disponibilidade. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Configuration Panel */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
        <h3 className="text-sm font-medium text-blue-700 mb-3">Configuração Rápida</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-blue-700 mb-2">Aplicar a:</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Dias úteis
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Fim de semana
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Semana toda
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-blue-700 mb-2">Definir como:</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1">
                <SunMedium className="h-3 w-3" />
                Manhãs
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1">
                <Sunset className="h-3 w-3" />
                Tardes
              </Button>
              <Button variant="default" size="sm" className="h-8 text-xs flex items-center gap-1 bg-green-600">
                <CalendarCheck className="h-3 w-3" />
                Dia todo
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50">
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
