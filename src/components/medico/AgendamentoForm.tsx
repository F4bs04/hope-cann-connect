
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, addMonths, addWeeks, setDate } from 'date-fns';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { CheckboxReact } from "@/components/ui/checkbox-react";
import { AlertCircle, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';

interface AgendamentoFormProps {
  onSuccess: () => void;
}

interface FormValues {
  dataConsulta: Date;
  horario: string;
  tipoConsulta: string;
  motivo: string;
  repeticao: string;
  diasSemana?: string[];
  diaMes?: number;
}

interface DiasSemanaOption {
  value: string;
  label: string;
}

const AgendamentoForm: React.FC<AgendamentoFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medicoId, setMedicoId] = useState<number | null>(null);
  
  const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];
  
  const diasSemanaOptions: DiasSemanaOption[] = [
    { value: 'segunda', label: 'Segunda-feira' },
    { value: 'terca', label: 'Terça-feira' },
    { value: 'quarta', label: 'Quarta-feira' },
    { value: 'quinta', label: 'Quinta-feira' },
    { value: 'sexta', label: 'Sexta-feira' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' },
  ];
  
  const form = useForm<FormValues>({
    defaultValues: {
      dataConsulta: new Date(),
      horario: '',
      tipoConsulta: 'Consulta padrão',
      motivo: '',
      repeticao: 'nenhuma',
      diasSemana: [],
      diaMes: undefined,
    },
  });
  
  const repeticaoValue = form.watch('repeticao');
  
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  
  useEffect(() => {
    const fetchMedicoId = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Você precisa estar logado para agendar consultas");
          return;
        }
        
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', session.user.email)
          .single();
          
        if (userError) throw userError;
        
        const { data: medicoData, error: medicoError } = await supabase
          .from('medicos')
          .select('id')
          .eq('id_usuario', userData.id)
          .single();
          
        if (medicoError) throw medicoError;
        
        setMedicoId(medicoData.id);
      } catch (error: any) {
        console.error("Erro ao buscar médico:", error);
        setError("Não foi possível obter sua identificação como médico");
      }
    };
    
    fetchMedicoId();
  }, []);
  
  const onSubmit = async (data: FormValues) => {
    if (!medicoId) {
      setError("ID do médico não encontrado");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Combine date and time
      const dataHora = new Date(data.dataConsulta);
      const [hours, minutes] = data.horario.split(':').map(Number);
      dataHora.setHours(hours, minutes, 0, 0);
      
      if (data.repeticao === 'nenhuma') {
        // Create a single appointment
        const { error: appointmentError } = await supabase
          .from('consultas')
          .insert({
            id_medico: medicoId,
            data_hora: dataHora.toISOString(),
            tipo_consulta: data.tipoConsulta,
            motivo: data.motivo,
            status: 'agendada',
            repeticao: 'nenhuma'
          });
          
        if (appointmentError) throw appointmentError;
      } 
      else if (data.repeticao === 'semanal' && data.diasSemana && data.diasSemana.length > 0) {
        // Create weekly recurring appointments for 3 months
        const endDate = addMonths(new Date(), 3); // 3 months in the future
        let currentDate = new Date(data.dataConsulta);
        
        while (currentDate < endDate) {
          const dayOfWeek = format(currentDate, 'EEEE', { locale: ptBR }).toLowerCase();
          
          if (data.diasSemana.includes(dayOfWeek)) {
            const appointmentDate = new Date(currentDate);
            appointmentDate.setHours(hours, minutes, 0, 0);
            
            const { error: appointmentError } = await supabase
              .from('consultas')
              .insert({
                id_medico: medicoId,
                data_hora: appointmentDate.toISOString(),
                tipo_consulta: data.tipoConsulta,
                motivo: data.motivo,
                status: 'agendada',
                repeticao: 'semanal',
                dias_semana: data.diasSemana
              });
              
            if (appointmentError) throw appointmentError;
          }
          
          // Move to the next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } 
      else if (data.repeticao === 'mensal' && data.diaMes) {
        // Create monthly recurring appointments for 6 months
        const endDate = addMonths(new Date(), 6); // 6 months in the future
        let currentDate = new Date(data.dataConsulta);
        
        while (currentDate < endDate) {
          try {
            // Set the specific day of the month
            const appointmentDate = setDate(currentDate, data.diaMes);
            appointmentDate.setHours(hours, minutes, 0, 0);
            
            // Only add if the date is valid and in the future
            if (!isNaN(appointmentDate.getTime()) && appointmentDate > new Date()) {
              const { error: appointmentError } = await supabase
                .from('consultas')
                .insert({
                  id_medico: medicoId,
                  data_hora: appointmentDate.toISOString(),
                  tipo_consulta: data.tipoConsulta,
                  motivo: data.motivo,
                  status: 'agendada',
                  repeticao: 'mensal',
                  dia_mes: data.diaMes
                });
                
              if (appointmentError) throw appointmentError;
            }
          } catch (error) {
            console.error('Error with date:', error);
            // Continue with the next month even if this month had an error
          }
          
          // Move to the next month
          currentDate = addMonths(currentDate, 1);
        }
      }
      
      toast({
        title: "Agendamento realizado",
        description: "As consultas foram agendadas com sucesso!",
      });
      
      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao agendar consulta:", error);
      
      if (error.message.includes('Conflito de horário detectado')) {
        setError("Já existe uma consulta agendada para este horário");
      } else {
        setError(error.message || "Ocorreu um erro ao agendar a consulta");
      }
      
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
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dataConsulta"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-2">
                  <FormLabel>Data Inicial</FormLabel>
                  <FormControl>
                    <div className="border rounded-md p-2">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={ptBR}
                        disabled={(date) => date < new Date()}
                        className="mx-auto"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Selecione a data para a consulta
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
                    <FormLabel>Horário</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um horário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Horários disponíveis em intervalos de 30 minutos
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
                          <SelectValue placeholder="Selecione o tipo de consulta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Consulta padrão">Consulta padrão</SelectItem>
                        <SelectItem value="Retorno">Retorno</SelectItem>
                        <SelectItem value="Primeira consulta">Primeira consulta</SelectItem>
                        <SelectItem value="Emergência">Emergência</SelectItem>
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
                    <FormLabel>Descrição / Motivo</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o motivo da consulta" 
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="repeticao"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Repetição</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="nenhuma" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Sem repetição
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="semanal" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Repetir semanalmente
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="mensal" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Repetir mensalmente
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {repeticaoValue === 'semanal' && (
                <div className="mt-4">
                  <Label>Dias da semana</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    {diasSemanaOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <CheckboxReact
                          id={option.value}
                          checked={form.watch('diasSemana')?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const current = form.watch('diasSemana') || [];
                            if (checked) {
                              form.setValue('diasSemana', [...current, option.value]);
                            } else {
                              form.setValue('diasSemana', current.filter(day => day !== option.value));
                            }
                          }}
                        />
                        <label
                          htmlFor={option.value}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {repeticaoValue === 'mensal' && (
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="diaMes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia do mês</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o dia do mês" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {daysOfMonth.map((day) => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? "Agendando..." : "Agendar Consulta"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AgendamentoForm;
