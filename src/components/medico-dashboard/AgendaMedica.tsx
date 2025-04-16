
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Save, 
  SunMedium, 
  Sunset, 
  Calendar, 
  Check, 
  X,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { format, addDays, startOfWeek, isEqual } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AgendaMedica: React.FC = () => {
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'calendar'>('week');
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [currentDay, setCurrentDay] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({
    'segunda': ['08:00', '09:00', '10:00'],
    'terça': ['14:00', '15:00', '16:00'],
    'quarta': [],
    'quinta': ['08:00', '09:00', '14:00', '15:00'],
    'sexta': ['08:00', '09:00'],
    'sábado': [],
    'domingo': []
  });

  const [quickSetMode, setQuickSetMode] = useState<'morning' | 'afternoon' | 'all' | 'none'>('morning');

  const morningSlots = ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  const afternoonSlots = ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

  const formatWeekday = (date: Date): string => {
    return format(date, 'EEEE', { locale: ptBR });
  };

  const getDaySlots = (day: Date): string[] => {
    const dayName = formatWeekday(day).toLowerCase();
    return availableSlots[dayName] || [];
  };

  const hasMorningSlots = (day: Date): boolean => {
    const slots = getDaySlots(day);
    return slots.some(slot => {
      const hour = parseInt(slot.split(':')[0]);
      return hour < 12;
    });
  };

  const hasAfternoonSlots = (day: Date): boolean => {
    const slots = getDaySlots(day);
    return slots.some(slot => {
      const hour = parseInt(slot.split(':')[0]);
      return hour >= 12;
    });
  };

  const nextWeek = () => {
    setSelectedWeekStart(addDays(selectedWeekStart, 7));
  };

  const prevWeek = () => {
    setSelectedWeekStart(addDays(selectedWeekStart, -7));
  };

  const nextDay = () => {
    setCurrentDay(addDays(currentDay, 1));
  };

  const prevDay = () => {
    setCurrentDay(addDays(currentDay, -1));
  };

  const toggleDayAvailability = (day: Date, available: boolean) => {
    const dayName = formatWeekday(day).toLowerCase();
    if (available) {
      setAvailableSlots(prev => ({
        ...prev,
        [dayName]: morningSlots.slice(0, 3) // Default to first 3 morning slots
      }));
    } else {
      setAvailableSlots(prev => ({
        ...prev,
        [dayName]: []
      }));
    }
  };

  const setDayAvailability = (day: Date, mode: 'morning' | 'afternoon' | 'all' | 'none') => {
    const dayName = formatWeekday(day).toLowerCase();
    let newSlots: string[] = [];
    
    if (mode === 'morning') {
      newSlots = morningSlots;
    } else if (mode === 'afternoon') {
      newSlots = afternoonSlots;
    } else if (mode === 'all') {
      newSlots = [...morningSlots, ...afternoonSlots];
    }
    
    setAvailableSlots(prev => ({
      ...prev,
      [dayName]: newSlots
    }));
  };

  const applyToWeek = (pattern: 'workdays' | 'weekend' | 'all', mode: 'morning' | 'afternoon' | 'all' | 'none') => {
    let newAvailableSlots = { ...availableSlots };
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(selectedWeekStart, i);
      const dayOfWeek = day.getDay();
      const dayName = formatWeekday(day).toLowerCase();
      
      const isWorkday = dayOfWeek >= 1 && dayOfWeek <= 5;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if ((pattern === 'workdays' && isWorkday) || 
          (pattern === 'weekend' && isWeekend) || 
          pattern === 'all') {
        
        let slots: string[] = [];
        if (mode === 'morning') {
          slots = morningSlots;
        } else if (mode === 'afternoon') {
          slots = afternoonSlots;
        } else if (mode === 'all') {
          slots = [...morningSlots, ...afternoonSlots];
        }
        
        newAvailableSlots[dayName] = slots;
      }
    }
    
    setAvailableSlots(newAvailableSlots);
  };

  const renderWeekView = () => (
    <>
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
                onClick={() => applyToWeek('workdays', quickSetMode)}
              >
                Dias úteis
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs"
                onClick={() => applyToWeek('weekend', quickSetMode)}
              >
                Fim de semana
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs"
                onClick={() => applyToWeek('all', quickSetMode)}
              >
                Semana toda
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-blue-700 mb-2">Definir como:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={quickSetMode === 'morning' ? "default" : "outline"} 
                size="sm" 
                className={`h-8 text-xs flex items-center gap-1 ${quickSetMode === 'morning' ? 'bg-blue-600' : ''}`}
                onClick={() => setQuickSetMode('morning')}
              >
                <SunMedium className="h-3 w-3" />
                Manhãs
              </Button>
              <Button 
                variant={quickSetMode === 'afternoon' ? "default" : "outline"} 
                size="sm" 
                className={`h-8 text-xs flex items-center gap-1 ${quickSetMode === 'afternoon' ? 'bg-orange-500' : ''}`}
                onClick={() => setQuickSetMode('afternoon')}
              >
                <Sunset className="h-3 w-3" />
                Tardes
              </Button>
              <Button 
                variant={quickSetMode === 'all' ? "default" : "outline"} 
                size="sm" 
                className={`h-8 text-xs flex items-center gap-1 ${quickSetMode === 'all' ? 'bg-green-600' : ''}`}
                onClick={() => setQuickSetMode('all')}
              >
                <Check className="h-3 w-3" />
                Dia todo
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => applyToWeek('all', 'none')}
              >
                <X className="h-3 w-3" />
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={prevWeek}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Semana anterior
        </Button>
        <h3 className="text-lg font-medium">
          {format(selectedWeekStart, "dd 'de' MMMM", { locale: ptBR })} - {format(addDays(selectedWeekStart, 6), "dd 'de' MMMM", { locale: ptBR })}
        </h3>
        <Button variant="outline" size="sm" onClick={nextWeek}>
          Próxima semana <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => {
          const day = addDays(selectedWeekStart, i);
          const dayName = formatWeekday(day);
          const dayOfMonth = format(day, 'dd/MM');
          const daySlots = getDaySlots(day);
          const hasSlots = daySlots.length > 0;
          
          return (
            <div key={i} className="border rounded-md overflow-hidden bg-white hover:shadow transition-shadow">
              <div 
                className={`text-center p-2 cursor-pointer border-b ${
                  (day.getDay() === 0 || day.getDay() === 6) ? 'bg-orange-50' : 'bg-blue-50'
                }`}
                onClick={() => {
                  setCurrentDay(day);
                  setViewMode('day');
                }}
              >
                <div className="font-medium capitalize">{dayName}</div>
                <div className="text-sm font-bold">{dayOfMonth}</div>
              </div>
              
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Disponível:</span>
                  <Switch 
                    checked={hasSlots}
                    onCheckedChange={(checked) => toggleDayAvailability(day, checked)}
                    size="sm"
                  />
                </div>
                
                {hasSlots ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-1">
                      <Button 
                        variant={hasMorningSlots(day) ? "default" : "outline"} 
                        size="sm" 
                        className={`h-7 text-xs flex items-center gap-1 ${hasMorningSlots(day) ? 'bg-blue-600' : ''}`}
                        onClick={() => setDayAvailability(day, 'morning')}
                      >
                        <SunMedium className="h-3 w-3" />
                        Manhã
                      </Button>
                      <Button 
                        variant={hasAfternoonSlots(day) ? "default" : "outline"} 
                        size="sm" 
                        className={`h-7 text-xs flex items-center gap-1 ${hasAfternoonSlots(day) ? 'bg-orange-500' : ''}`}
                        onClick={() => setDayAvailability(day, 'afternoon')}
                      >
                        <Sunset className="h-3 w-3" />
                        Tarde
                      </Button>
                    </div>
                    
                    <div className="flex justify-center items-center">
                      <button 
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1" 
                        onClick={() => {
                          setCurrentDay(day);
                          setViewMode('day');
                        }}
                      >
                        <Calendar className="h-3 w-3" />
                        <span>{daySlots.length} horários</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-7 text-xs"
                    onClick={() => setDayAvailability(day, 'all')}
                  >
                    Disponibilizar
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderDayView = () => {
    const dayName = formatWeekday(currentDay);
    const daySlots = getDaySlots(currentDay);
    const isMorningSelected = hasMorningSlots(currentDay);
    const isAfternoonSelected = hasAfternoonSlots(currentDay);
    
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" size="sm" onClick={prevDay}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Dia anterior
          </Button>
          <div className="flex items-center">
            <h3 className="text-xl font-medium capitalize">
              {dayName}, {format(currentDay, "dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setViewMode('week')} className="ml-2">
              <Calendar className="h-4 w-4 mr-1" /> Ver semana
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={nextDay}>
            Próximo dia <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium flex items-center">
                  <SunMedium className="h-4 w-4 mr-2 text-blue-600" /> Manhã
                </h4>
                <Switch 
                  checked={isMorningSelected}
                  onCheckedChange={(checked) => {
                    const dayName = formatWeekday(currentDay).toLowerCase();
                    if (checked) {
                      setAvailableSlots(prev => ({
                        ...prev,
                        [dayName]: [...(isAfternoonSelected ? getDaySlots(currentDay) : []), ...morningSlots]
                      }));
                    } else {
                      setAvailableSlots(prev => ({
                        ...prev,
                        [dayName]: getDaySlots(currentDay).filter(slot => {
                          const hour = parseInt(slot.split(':')[0]);
                          return hour >= 12;
                        })
                      }));
                    }
                  }}
                />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {morningSlots.map(slot => {
                  const isSelected = daySlots.includes(slot);
                  return (
                    <Button 
                      key={slot}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`text-sm ${isSelected ? 'bg-blue-600' : ''}`}
                      onClick={() => {
                        const dayName = formatWeekday(currentDay).toLowerCase();
                        if (isSelected) {
                          setAvailableSlots(prev => ({
                            ...prev,
                            [dayName]: prev[dayName].filter(s => s !== slot)
                          }));
                        } else {
                          setAvailableSlots(prev => ({
                            ...prev,
                            [dayName]: [...prev[dayName], slot].sort()
                          }));
                        }
                      }}
                    >
                      {slot}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium flex items-center">
                  <Sunset className="h-4 w-4 mr-2 text-orange-500" /> Tarde
                </h4>
                <Switch 
                  checked={isAfternoonSelected}
                  onCheckedChange={(checked) => {
                    const dayName = formatWeekday(currentDay).toLowerCase();
                    if (checked) {
                      setAvailableSlots(prev => ({
                        ...prev,
                        [dayName]: [...(isMorningSelected ? getDaySlots(currentDay) : []), ...afternoonSlots]
                      }));
                    } else {
                      setAvailableSlots(prev => ({
                        ...prev,
                        [dayName]: getDaySlots(currentDay).filter(slot => {
                          const hour = parseInt(slot.split(':')[0]);
                          return hour < 12;
                        })
                      }));
                    }
                  }}
                />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {afternoonSlots.map(slot => {
                  const isSelected = daySlots.includes(slot);
                  return (
                    <Button 
                      key={slot}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`text-sm ${isSelected ? 'bg-orange-500' : ''}`}
                      onClick={() => {
                        const dayName = formatWeekday(currentDay).toLowerCase();
                        if (isSelected) {
                          setAvailableSlots(prev => ({
                            ...prev,
                            [dayName]: prev[dayName].filter(s => s !== slot)
                          }));
                        } else {
                          setAvailableSlots(prev => ({
                            ...prev,
                            [dayName]: [...prev[dayName], slot].sort()
                          }));
                        }
                      }}
                    >
                      {slot}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agenda Médica</h1>
        <p className="text-gray-600">
          Gerenciamento de Consultas
        </p>
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'week' ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode('week')}
            className="flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            Semana
          </Button>
          <Button
            variant={viewMode === 'day' ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode('day')}
            className="flex items-center gap-1"
          >
            <CalendarIcon className="h-4 w-4" />
            Dia
          </Button>
        </div>
        
        <Button className="bg-green-500 hover:bg-green-600">
          <Plus className="h-4 w-4 mr-2" /> Liberar horário
        </Button>
      </div>
      
      <div className="bg-white rounded-lg border p-6">
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
      
      <div className="mt-6 flex justify-center">
        <Button className="bg-[#00B3B0] hover:bg-[#009E9B] flex items-center">
          <Save className="h-4 w-4 mr-2" /> Salvar Informações
        </Button>
      </div>
    </div>
  );
};

export default AgendaMedica;
