import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';
import { cn } from '@/lib/utils';

interface AgendarConsultaPacienteProps {
  onSuccess?: () => void;
  selectedDoctorId?: string | null;
}

interface FormValues {
  medicoId: string;
  dataConsulta: Date;
  horario: string;
  tipoConsulta: string;
  motivo: string;
}

interface Medico {
  id: string;
  nome: string;
  especialidade: string;
  crm: string;
}

const AgendarConsultaPaciente: React.FC<AgendarConsultaPacienteProps> = ({ 
  onSuccess,
  selectedDoctorId 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [pacienteId, setPacienteId] = useState<number | null>(null);
  
  const form = useForm<FormValues>({
    defaultValues: {
      medicoId: selectedDoctorId || '',
      dataConsulta: new Date(),
      horario: '',
      tipoConsulta: 'presencial',
      motivo: '',
    },
  });
  
  const selectedMedicoId = form.watch('medicoId');
  const selectedDate = form.watch('dataConsulta');
  
  const { timeSlots, loading: slotsLoading } = useAvailableTimeSlots(
    selectedMedicoId || null, 
    selectedDate
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        if (!isAuthenticated || !userEmail) {
          setError("Você precisa estar logado para agendar consultas");
          return;
        }
        
        // Buscar ID do paciente usando o email do localStorage
        const { data: pacienteData, error: pacienteError } = await supabase
          .from('pacientes')
          .select('id')
          .eq('email', userEmail)
          .maybeSingle();
          
        if (pacienteError) {
          console.error("Erro ao buscar paciente:", pacienteError);
          throw pacienteError;
        }
        
        if (!pacienteData) {
          setError("Perfil de paciente não encontrado");
          return;
        }
        
        setPacienteId(pacienteData.id);
        
        // Buscar médicos disponíveis
        const { data: medicosData, error: medicosError } = await supabase
          .from('medicos')
          .select('id, nome, especialidade, crm')
          .eq('aprovado', true)
          .eq('status_disponibilidade', true)
          .order('nome');
          
        if (medicosError) throw medicosError;
        
        setMedicos(medicosData || []);
        
        // Se um médico específico foi selecionado, definir no formulário
        if (selectedDoctorId) {
          form.setValue('medicoId', selectedDoctorId);
        }
      } catch (error: any) {
        console.error("Erro ao buscar dados:", error);
        setError("Não foi possível carregar os dados necessários");
      }
    };
    
    fetchData();
  }, [selectedDoctorId, form]);

  const onSubmit = async (data: FormValues) => {
    if (!pacienteId) {
      setError("ID do paciente não encontrado");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Combine date and time
      const dataHora = new Date(data.dataConsulta);
      const [hours, minutes] = data.horario.split(':').map(Number);
      dataHora.setHours(hours, minutes, 0, 0);
      
      // Verificar se o horário ainda está disponível
      const dateStr = format(dataHora, 'yyyy-MM-dd');
      const timeStr = format(dataHora, 'HH:mm');
      
      const { data: consultasExistentes, error: consultasError } = await supabase
        .from('consultas')
        .select('id')
        .eq('id_medico', data.medicoId)
        .gte('data_hora', `${dateStr}T${timeStr}:00`)
        .lt('data_hora', `${dateStr}T${timeStr}:30`)
        .neq('status', 'cancelada');

      if (consultasError) {
        console.error('Erro ao verificar disponibilidade:', consultasError);
        throw new Error('Erro ao verificar disponibilidade do horário');
      }

      if (consultasExistentes && consultasExistentes.length > 0) {
        setError("Este horário não está mais disponível");
        toast({
          variant: "destructive",
          title: "Horário indisponível",
          description: "Este horário já foi agendado por outro paciente",
        });
        return;
      }
      
      // Criar a consulta
      const { error: appointmentError } = await supabase
        .from('consultas')
        .insert({
          id_medico: data.medicoId,
          id_paciente: pacienteId,
          data_hora: dataHora.toISOString(),
          tipo_consulta: data.tipoConsulta,
          motivo: data.motivo,
          status: 'agendada',
          repeticao: 'nenhuma'
        });
        
      if (appointmentError) throw appointmentError;
      
      toast({
        title: "Consulta agendada",
        description: "Sua consulta foi agendada com sucesso!",
      });
      
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao agendar consulta:", error);
      setError(error.message || "Ocorreu um erro ao agendar a consulta");
      
      toast({
        variant: "destructive",
        title: "Erro ao agendar",
        description: error.message || "Ocorreu um erro ao agendar a consulta",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {!selectedDoctorId && (
            <FormField
              control={form.control}
              name="medicoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Médico
                  </FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value)} 
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um médico" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {medicos.map((medico) => (
                        <SelectItem key={medico.id} value={medico.id}>
                          {medico.nome} - {medico.especialidade} ({medico.crm})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Escolha o médico para sua consulta
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dataConsulta"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Data da Consulta
                  </FormLabel>
                  <FormControl>
                    <div className="border rounded-md p-2">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date);
                            form.setValue('horario', ''); // Reset time when date changes
                          }
                        }}
                        locale={ptBR}
                        disabled={(date) => date < new Date()}
                        className="mx-auto"
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-full",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors",
                          day_range_end: "day-range-end",
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
                          day_today: "bg-accent text-accent-foreground rounded-full",
                          day_outside: "day-outside text-muted-foreground/60 opacity-60",
                          day_disabled: "text-muted-foreground/40 opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground/40",
                          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                          day_hidden: "invisible",
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Selecione a data desejada para sua consulta
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="horario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Horário
                    </FormLabel>
                    {selectedMedicoId && selectedDate ? (
                      <div className="space-y-3">
                        {slotsLoading ? (
                          <div className="text-center py-4">
                            <p className="text-muted-foreground">Carregando horários...</p>
                          </div>
                        ) : timeSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                            {timeSlots.map((slot) => (
                              <Button
                                key={slot.time}
                                type="button"
                                onClick={() => field.onChange(slot.time)}
                                variant={field.value === slot.time ? "default" : "outline"}
                                disabled={!slot.available}
                                className={cn(
                                  "h-12 text-sm",
                                  !slot.available && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                <div className="flex flex-col items-center">
                                  <span>{slot.time}</span>
                                  {!slot.available && (
                                    <span className="text-xs opacity-70">ocupado</span>
                                  )}
                                </div>
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            Não há horários disponíveis para esta data
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Selecione um médico e uma data para ver os horários disponíveis
                      </p>
                    )}
                    <FormDescription>
                      Horários baseados na disponibilidade do médico
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tipoConsulta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Consulta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="telemedicina">Telemedicina</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="motivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo da Consulta</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva brevemente o motivo da consulta" 
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Opcional: descreva o que você gostaria de tratar na consulta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || !selectedMedicoId || !selectedDate || !form.watch('horario')}
          >
            {loading ? "Agendando..." : "Confirmar Agendamento"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AgendarConsultaPaciente;