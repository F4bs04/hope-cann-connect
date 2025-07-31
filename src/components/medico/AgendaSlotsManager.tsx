import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DoctorAvailabilityService from '@/services/doctorAvailability/doctorAvailabilityService';

interface TimeSlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface DaySchedule {
  day: string;
  dayName: string;
  slots: TimeSlot[];
  isActive: boolean;
}

const DAYS_OF_WEEK = [
  { key: 'monday', name: 'Segunda-feira', short: 'SEG' },
  { key: 'tuesday', name: 'Terça-feira', short: 'TER' },
  { key: 'wednesday', name: 'Quarta-feira', short: 'QUA' },
  { key: 'thursday', name: 'Quinta-feira', short: 'QUI' },
  { key: 'friday', name: 'Sexta-feira', short: 'SEX' },
  { key: 'saturday', name: 'Sábado', short: 'SAB' },
  { key: 'sunday', name: 'Domingo', short: 'DOM' }
];

const TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

export default function AgendaSlotsManager() {
  const authContext = useAuth();
  const { userProfile, isAuthenticated } = authContext;
  const user = userProfile; // Use userProfile as user for compatibility
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [newSlot, setNewSlot] = useState({ startTime: '', endTime: '' });

  // Debug: Log do contexto de autenticação
  useEffect(() => {
    console.log('=== DEBUG AUTH CONTEXT ===');
    console.log('authContext:', authContext);
    console.log('user:', user);
    console.log('userProfile:', userProfile);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user?.id:', user?.id);
    console.log('========================');
  }, [authContext, user, userProfile, isAuthenticated]);

  useEffect(() => {
    initializeSchedule();
    loadDoctorSchedule();
  }, [user]);

  // Garantir que o loading seja finalizado se não houver usuário após um tempo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && !user?.id) {
        setLoading(false);
      }
    }, 2000); // 2 segundos de timeout

    return () => clearTimeout(timer);
  }, [loading, user?.id]);

  const initializeSchedule = () => {
    const schedule = DAYS_OF_WEEK.map(day => ({
      day: day.key,
      dayName: day.name,
      slots: [],
      isActive: false
    }));
    setWeeklySchedule(schedule);
  };

  const loadDoctorSchedule = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        // Se não há usuário, inicializar com agenda vazia
        const emptySchedule = DoctorAvailabilityService.getEmptySchedule();
        setWeeklySchedule(emptySchedule);
        setLoading(false);
        return;
      }
      
      // Carregar horários do Supabase
      const savedSchedule = await DoctorAvailabilityService.loadDoctorSchedule(user.id);
      if (savedSchedule && savedSchedule.length > 0) {
        setWeeklySchedule(savedSchedule);
      } else {
        // Se não há dados salvos, inicializar com agenda vazia
        const emptySchedule = DoctorAvailabilityService.getEmptySchedule();
        setWeeklySchedule(emptySchedule);
      }
      
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
      toast.error('Erro ao carregar horários da agenda');
      // Em caso de erro, inicializar com agenda vazia
      const emptySchedule = DoctorAvailabilityService.getEmptySchedule();
      setWeeklySchedule(emptySchedule);
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async () => {
    console.log('=== INÍCIO SAVESCHEDULE (SUPABASE) ===');
    console.log('user?.id:', user?.id);
    console.log('userProfile?.id:', userProfile?.id);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('weeklySchedule:', weeklySchedule);
    console.log('weeklySchedule.length:', weeklySchedule?.length);
    
    // Tentar múltiplas formas de obter o ID do usuário
    let userId = null;
    if (user?.id) {
      userId = user.id;
      console.log('Usando user.id:', userId);
    } else if (userProfile?.id) {
      userId = userProfile.id;
      console.log('Usando userProfile.id:', userId);
    }
    
    if (!userId) {
      console.error('ERRO: Nenhum ID de usuário encontrado');
      console.log('- user?.id:', user?.id);
      console.log('- userProfile?.id:', userProfile?.id);
      toast.error('Usuário não identificado. Faça login novamente.');
      return;
    }

    if (!weeklySchedule || weeklySchedule.length === 0) {
      console.error('ERRO: Agenda vazia ou inválida');
      toast.error('Nenhuma agenda para salvar.');
      return;
    }

    try {
      setSaving(true);
      console.log('Iniciando salvamento no Supabase com userId:', userId);
      
      // Salvar usando o serviço do Supabase
      const success = await DoctorAvailabilityService.saveDoctorSchedule(userId, weeklySchedule);
      
      if (success) {
        console.log('✅ Agenda salva com sucesso no Supabase');
        toast.success('Horários salvos com sucesso!');
      } else {
        throw new Error('Falha ao salvar no Supabase');
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar agenda:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      toast.error('Erro ao salvar horários: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setSaving(false);
      console.log('=== FIM SAVESCHEDULE (SUPABASE) ===');
    }
  };

  const addTimeSlot = () => {
    if (!selectedDay || !newSlot.startTime || !newSlot.endTime) {
      toast.error('Selecione o dia e os horários de início e fim');
      return;
    }

    if (newSlot.startTime >= newSlot.endTime) {
      toast.error('Horário de início deve ser anterior ao horário de fim');
      return;
    }

    const newSlotData: TimeSlot = {
      id: `${selectedDay}_${newSlot.startTime}_${newSlot.endTime}_${Date.now()}`,
      dayOfWeek: selectedDay,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      isActive: true
    };

    setWeeklySchedule(prev => prev.map(day => {
      if (day.day === selectedDay) {
        return {
          ...day,
          slots: [...day.slots, newSlotData].sort((a, b) => a.startTime.localeCompare(b.startTime)),
          isActive: true
        };
      }
      return day;
    }));

    setNewSlot({ startTime: '', endTime: '' });
    toast.success('Horário adicionado com sucesso!');
  };

  const removeTimeSlot = (dayKey: string, slotId: string) => {
    setWeeklySchedule(prev => prev.map(day => {
      if (day.day === dayKey) {
        const updatedSlots = day.slots.filter(slot => slot.id !== slotId);
        return {
          ...day,
          slots: updatedSlots,
          isActive: updatedSlots.length > 0
        };
      }
      return day;
    }));
    toast.success('Horário removido com sucesso!');
  };

  const toggleDayActive = (dayKey: string) => {
    setWeeklySchedule(prev => prev.map(day => {
      if (day.day === dayKey) {
        return { ...day, isActive: !day.isActive };
      }
      return day;
    }));
  };

  const getTotalSlotsCount = () => {
    return weeklySchedule.reduce((total, day) => total + day.slots.length, 0);
  };

  const getActiveDaysCount = () => {
    return weeklySchedule.filter(day => day.isActive && day.slots.length > 0).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-hopecann-teal" />
          <p className="text-gray-600">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dias Ativos</p>
                <p className="text-2xl font-bold text-hopecann-teal">{getActiveDaysCount()}</p>
              </div>
              <Calendar className="w-8 h-8 text-hopecann-teal" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Horários</p>
                <p className="text-2xl font-bold text-hopecann-teal">{getTotalSlotsCount()}</p>
              </div>
              <Clock className="w-8 h-8 text-hopecann-teal" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Botão clicado!');
                  saveSchedule();
                }} 
                disabled={saving}
                className="w-full bg-hopecann-teal hover:bg-hopecann-teal/90 disabled:opacity-50"
                type="button"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Agenda'}
              </Button>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário para adicionar horários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Horário de Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="day-select">Dia da Semana</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map(day => (
                    <SelectItem key={day.key} value={day.key}>
                      {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="start-time">Horário de Início</Label>
              <Select value={newSlot.startTime} onValueChange={(value) => setNewSlot(prev => ({ ...prev, startTime: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Início" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="end-time">Horário de Fim</Label>
              <Select value={newSlot.endTime} onValueChange={(value) => setNewSlot(prev => ({ ...prev, endTime: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Fim" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={addTimeSlot} className="w-full bg-hopecann-teal hover:bg-hopecann-teal/90">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade semanal de horários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {weeklySchedule.map(day => (
          <Card key={day.day} className={`${day.isActive && day.slots.length > 0 ? 'ring-2 ring-hopecann-teal' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{day.dayName}</CardTitle>
                <Badge variant={day.isActive && day.slots.length > 0 ? "default" : "secondary"}>
                  {day.slots.length} horário{day.slots.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {day.slots.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm">Nenhum horário definido</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {day.slots.map(slot => (
                    <div key={slot.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-hopecann-teal" />
                        <span className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(day.day, slot.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo da agenda */}
      {getTotalSlotsCount() > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Agenda Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-hopecann-teal">{getActiveDaysCount()}</p>
                <p className="text-sm text-gray-600">Dias com atendimento</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-hopecann-teal">{getTotalSlotsCount()}</p>
                <p className="text-sm text-gray-600">Horários disponíveis</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-hopecann-teal">
                  {Math.round(getTotalSlotsCount() / getActiveDaysCount() || 0)}
                </p>
                <p className="text-sm text-gray-600">Média por dia</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-hopecann-teal">
                  {getTotalSlotsCount() * 30} min
                </p>
                <p className="text-sm text-gray-600">Tempo total semanal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}