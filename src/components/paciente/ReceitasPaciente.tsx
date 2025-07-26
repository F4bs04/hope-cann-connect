import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ReceitasPaciente: React.FC = () => {
  const [receitas, setReceitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceitas = async () => {
      setLoading(true);
      setError(null);
      try {
        const pacienteId = localStorage.getItem('userId');
        if (!pacienteId) throw new Error('Paciente não autenticado');
        const { data, error } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('patient_id', pacienteId)
          .order('issued_at', { ascending: false });
        if (error) throw error;
        setReceitas(data || []);
      } catch (err: any) {
        setError(err.message);
        setReceitas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReceitas();
  }, []);

  if (loading) return <div>Carregando receitas...</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;
  if (receitas.length === 0) return <div>Nenhuma receita encontrada.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Minhas Receitas</h2>
      <ul className="space-y-4">
        {receitas.map((receita) => (
          <li key={receita.id} className="border rounded p-4">
            <div><b>Medicamento:</b> {receita.medication_name}</div>
            <div><b>Dosagem:</b> {receita.dosage}</div>
            <div><b>Frequência:</b> {receita.frequency}</div>
            <div><b>Duração:</b> {receita.duration}</div>
            <div><b>Emitida em:</b> {new Date(receita.issued_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReceitasPaciente;