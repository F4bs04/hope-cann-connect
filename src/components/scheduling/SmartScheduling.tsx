import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SmartScheduling: React.FC<any> = () => {
  // Importa hook e componentes necessários
  // Permite ao paciente escolher médico, data e horário
  const [doctorId, setDoctorId] = React.useState<string | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [doctors, setDoctors] = React.useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = React.useState(true);
  const { timeSlots, loading: slotsLoading, error: slotsError } = require('@/hooks/useAvailableTimeSlots').useAvailableTimeSlots(doctorId, selectedDate);
  const [agendamentoSuccess, setAgendamentoSuccess] = React.useState(false);
  const [agendamentoError, setAgendamentoError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchDoctors() {
      setLoadingDoctors(true);
      const { data, error } = await require('@/integrations/supabase/client').supabase
        .from('doctors')
        .select('id, name')
        .eq('approved', true);
      if (!error) setDoctors(data || []);
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
      const { error } = await require('@/integrations/supabase/client').supabase
        .from('appointments')
        .insert([{
          doctor_id: doctorId,
          patient_id: localStorage.getItem('userId'),
          scheduled_at: scheduledAt.toISOString(),
          status: 'scheduled',
        }]);
      if (error) throw error;
      setAgendamentoSuccess(true);
    } catch (err: any) {
      setAgendamentoError(err.message);
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
                {doctors.map((doc: any) => (
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
                {timeSlots.filter((slot: any) => slot.available).map((slot: any) => (
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