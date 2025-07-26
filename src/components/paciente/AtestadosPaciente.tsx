import React, { useEffect, useState } from 'react';
import 'react/jsx-runtime';
import { supabase } from '@/integrations/supabase/client';

const AtestadosPaciente: React.FC = () => {
  const [atestados, setAtestados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAtestados() {
      setLoading(true);
      setError(null);
      try {
        const pacienteId = localStorage.getItem('userId');
        if (!pacienteId) throw new Error('Paciente não autenticado');
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('patient_id', pacienteId)
          .eq('document_type', 'certificate')
          .order('issued_at', { ascending: false });
        if (error) throw error;
        setAtestados(data || []);
      } catch (err: any) {
        setError(err.message);
        setAtestados([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAtestados();
  }, []);

  if (loading) return <div>Carregando atestados...</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;
  if (atestados.length === 0) return <div>Nenhum atestado encontrado.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Meus Atestados</h2>
      <ul className="space-y-4">
        {atestados.map((atestado) => (
          <li key={atestado.id} className="border rounded p-4">
            <div><b>Título:</b> {atestado.title}</div>
            <div><b>Emitido em:</b> {new Date(atestado.issued_at).toLocaleString()}</div>
            <div><b>Assinado:</b> {atestado.is_signed ? 'Sim' : 'Não'}</div>
            <div><b>Arquivo:</b> {atestado.file_path ? <a href={atestado.file_path} target="_blank" rel="noopener noreferrer">Download</a> : '-'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AtestadosPaciente;