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
        // Get authenticated user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          throw new Error('Usuário não autenticado');
        }

        const userId = session.user.id;
        console.log('Fetching appointments for user:', userId);

        // Try to get patient_id from patients table first
        const { data: patientData } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', userId)
          .single();

        let patientId = patientData?.id || userId; // Fallback to user_id
        
        console.log('Using patient_id:', patientId);

        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            doctors!inner(
              id,
              specialty,
              profiles!inner(full_name)
            )
          `)
          .eq('patient_id', patientId)
          .order('scheduled_at', { ascending: false });
          
        if (error) throw error;
        
        console.log('Appointments found:', data);
        setConsultas(data || []);
      } catch (err: any) {
        console.error('Error fetching appointments:', err);
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
            <div><b>Médico:</b> {consulta.doctors?.profiles?.full_name || 'Nome não informado'}</div>
            <div><b>Especialidade:</b> {consulta.doctors?.specialty || '-'}</div>
            <div><b>Data:</b> {new Date(consulta.scheduled_at).toLocaleString()}</div>
            <div><b>Status:</b> {consulta.status}</div>
            <div><b>Motivo:</b> {consulta.reason}</div>
            <div><b>Taxa:</b> {consulta.fee ? `R$ ${consulta.fee.toFixed(2)}` : '-'}</div>
            <div><b>Status Pagamento:</b> {consulta.payment_status || 'pending'}</div>
            <div><b>Notas:</b> {consulta.notes || '-'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConsultasPaciente;