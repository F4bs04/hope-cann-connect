import React, { useEffect, useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ptBR } from 'date-fns/locale';
import { format, isSameDay, startOfDay, addDays } from 'date-fns';
import { doctorSlotsService, DoctorSlot } from '@/services/doctorSlots/doctorSlotsService';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus } from 'lucide-react';

const TIME_OPTIONS = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30','18:00','18:30','19:00','19:30','20:00'
];

export default function CalendarSlotsManager() {
  const { toast } = useToast();
  const { userProfile, isAuthenticated } = useAuth();

  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [slots, setSlots] = useState<DoctorSlot[]>([]);

  const rangeStart = useMemo(() => startOfDay(new Date()), []);
  const rangeEnd = useMemo(() => addDays(rangeStart, 60), [rangeStart]);

  // Load doctor id
  useEffect(() => {
    const loadDoctor = async () => {
      if (!isAuthenticated || !userProfile?.id) return;
      const id = await doctorSlotsService.getDoctorIdByUserId(userProfile.id);
      if (!id) {
        toast({ title: 'Perfil médico não encontrado', description: 'Finalize seu cadastro de médico para gerenciar slots.' });
      }
      setDoctorId(id);
    };
    loadDoctor();
  }, [isAuthenticated, userProfile?.id, toast]);

  // Load slots for range
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctorId) return;
      setLoading(true);
      const data = await doctorSlotsService.listSlotsForRange(doctorId, rangeStart, rangeEnd);
      setSlots(data);
      setLoading(false);
    };
    fetchSlots();
  }, [doctorId, rangeStart, rangeEnd]);

  const daysWithSlots = useMemo(() => {
    const set = new Set<string>();
    slots.forEach(s => set.add(format(new Date(s.starts_at), 'yyyy-MM-dd')));
    return Array.from(set).map(d => new Date(d + 'T00:00:00'));
  }, [slots]);

  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [] as DoctorSlot[];
    return slots.filter(s => isSameDay(new Date(s.starts_at), selectedDate));
  }, [slots, selectedDate]);

  const handleAddSlot = async () => {
    if (!doctorId || !selectedDate || !startTime) {
      toast({ title: 'Selecione data e horário', description: 'Escolha uma data no calendário e um horário de início.' });
      return;
    }

    // Prevent duplicates
    const startCandidate = new Date(selectedDate);
    const [h, m] = startTime.split(':').map(Number);
    startCandidate.setHours(h, m || 0, 0, 0);
    if (slotsForSelectedDay.some(s => new Date(s.starts_at).getTime() === startCandidate.getTime())) {
      toast({ title: 'Horário já existente', description: 'Este horário já foi adicionado para o dia selecionado.' });
      return;
    }

    const created = await doctorSlotsService.createSlot(doctorId, selectedDate, startTime, 30);
    if (created) {
      setSlots(prev => [...prev, created].sort((a,b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()));
      toast({ title: 'Slot adicionado', description: `${format(selectedDate, "dd/MM")} às ${startTime}` });
      setStartTime('');
    } else {
      toast({ title: 'Erro ao adicionar', description: 'Não foi possível criar o slot. Verifique suas permissões.' });
    }
  };

  const handleDeleteSlot = async (id: string) => {
    const ok = await doctorSlotsService.deleteSlot(id);
    if (ok) {
      setSlots(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Slot removido' });
    } else {
      toast({ title: 'Erro ao remover', description: 'Tente novamente.' });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gerenciar Slots por Calendário</h1>
        <Badge variant="secondary">Duração padrão: 30 min</Badge>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < startOfDay(new Date())}
              locale={ptBR}
              className="rounded-md border"
              modifiers={{ hasSlots: daysWithSlots }}
              modifiersClassNames={{
                hasSlots: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-primary"
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adicionar Slot no Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Data</label>
                <div className="text-base">{selectedDate ? format(selectedDate, 'EEEE, dd/MM', { locale: ptBR }) : 'Selecione no calendário'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horário (30 min)</label>
                <select
                  className="border rounded-md px-3 py-2 bg-background"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {TIME_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleAddSlot} disabled={!selectedDate || !startTime}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Slots do dia</h3>
              {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
              {!loading && slotsForSelectedDay.length === 0 && (
                <div className="text-sm text-muted-foreground">Nenhum slot para este dia.</div>
              )}
              <ul className="space-y-2">
                {slotsForSelectedDay.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="font-medium">{format(new Date(s.starts_at), 'HH:mm')}</span>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteSlot(s.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo Próximos 60 dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {daysWithSlots.map((d) => (
              <div key={d.toISOString()} className="rounded-md border px-3 py-2 text-sm">
                <div className="font-medium">{format(d, 'dd/MM')}</div>
                <div className="text-muted-foreground">
                  {slots.filter(s => isSameDay(new Date(s.starts_at), d)).length} slots
                </div>
              </div>
            ))}
            {daysWithSlots.length === 0 && (
              <div className="text-sm text-muted-foreground">Nenhum slot cadastrado nos próximos 60 dias.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
