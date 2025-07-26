import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ConsultasPaciente: React.FC = () => {
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsultas = async () => {
      setLoading(true);
      setError(null);
      try {
        const pacienteId = localStorage.getItem('userId');
        if (!pacienteId) throw new Error('Paciente não autenticado');
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', pacienteId)
          .order('scheduled_at', { ascending: false });
        if (error) throw error;
        setConsultas(data || []);
      } catch (err: any) {
        setError(err.message);
        setConsultas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultas();
  }, []);

  if (loading) return <div>Carregando consultas...</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;
  if (consultas.length === 0) return <div>Nenhuma consulta encontrada.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Minhas Consultas</h2>
      <ul className="space-y-4">
        {consultas.map((consulta) => (
          <li key={consulta.id} className="border rounded p-4">
            <div><b>Data:</b> {new Date(consulta.scheduled_at).toLocaleString()}</div>
            <div><b>Status:</b> {consulta.status}</div>
            <div><b>Motivo:</b> {consulta.reason}</div>
            <div><b>Notas:</b> {consulta.notes || '-'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConsultasPaciente;