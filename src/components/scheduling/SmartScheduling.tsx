import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';
import { supabase } from '@/integrations/supabase/client';

type Doctor = {
  id: string;
  name: string;
};
type TimeSlot = {
  time: string;
  available: boolean;
};

const SmartScheduling: React.FC = () => {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const { timeSlots, loading: slotsLoading, error: slotsError } = useAvailableTimeSlots(doctorId, selectedDate);
  const [agendamentoSuccess, setAgendamentoSuccess] = useState(false);
  const [agendamentoError, setAgendamentoError] = useState<string | null>(null);

  React.useEffect(() => {
    async function fetchDoctors() {
      setLoadingDoctors(true);
      const { data, error } = await supabase
        .from('medicos')
        .select('id, nome')
        .eq('aprovado', true);
      if (!error && data) setDoctors(data.map((m: any) => ({ id: m.id, name: m.nome })));
      setLoadingDoctors(false);
    }
    fetchDoctors();
  }, []);

  async function handleAgendar() {
    setAgendamentoError(null);
    if (!doctorId || !selectedDate || !selectedTime) return;
    try {
      const scheduledAt = new Date(selectedDate);
      const [h, m] = selectedTime.split(':');
      scheduledAt.setHours(Number(h), Number(m), 0, 0);
      const { error } = await supabase
        .from('consultas')
        .insert([{
          id_medico: doctorId,
          id_paciente: localStorage.getItem('userId') || '',
          data_hora: scheduledAt.toISOString(),
          status: 'agendada',
          motivo: 'Consulta agendada via plataforma',
        }]);
      if (error) throw error;
      setAgendamentoSuccess(true);
    } catch (err) {
      setAgendamentoError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Agendar Consulta</h2>
      {agendamentoSuccess ? (
        <Alert>
          <AlertDescription>
            Consulta agendada com sucesso!
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="mb-6">
            <label className="block mb-2 font-medium">Selecione o médico:</label>
            {loadingDoctors ? (
              <div>Carregando médicos...</div>
            ) : (
              <select
                className="w-full border rounded px-4 py-2"
                value={doctorId || ''}
                onChange={e => setDoctorId(e.target.value)}
              >
                <option value="">Escolha um médico</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            )}
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-medium">Selecione a data:</label>
            <input
              type="date"
              className="w-full border rounded px-4 py-2"
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChange={e => setSelectedDate(new Date(e.target.value))}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-medium">Selecione o horário:</label>
            {slotsLoading ? (
              <div>Carregando horários...</div>
            ) : slotsError ? (
              <div className="text-red-600">Erro: {slotsError}</div>
            ) : (
              <select
                className="w-full border rounded px-4 py-2"
                value={selectedTime || ''}
                onChange={e => setSelectedTime(e.target.value)}
                disabled={!doctorId || !selectedDate}
              >
                <option value="">Escolha um horário</option>
                {(timeSlots as TimeSlot[]).filter((slot) => slot.available).map((slot) => (
                  <option key={slot.time} value={slot.time}>{slot.time}</option>
                ))}
              </select>
            )}
          </div>
          {agendamentoError && (
            <div className="text-red-600 mb-4">Erro: {agendamentoError}</div>
          )}
          <button
            className="w-full bg-hopecann-teal text-white py-2 rounded font-bold hover:bg-hopecann-teal-dark transition"
            onClick={handleAgendar}
            disabled={!doctorId || !selectedDate || !selectedTime}
          >
            Agendar Consulta
          </button>
        </>
      )}
    </div>
  );
};

export default SmartScheduling;