import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const PedidosExamePaciente: React.FC = () => {
  const [exames, setExames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExames = async () => {
      setLoading(true);
      setError(null);
      try {
        const pacienteId = localStorage.getItem('userId');
        if (!pacienteId) throw new Error('Paciente não autenticado');
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('patient_id', pacienteId)
        .eq('document_type', 'exam_request')
        .order('issued_at', { ascending: false });
        if (error) throw error;
        setExames(data || []);
      } catch (err: any) {
        setError(err.message);
        setExames([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExames();
  }, []);

  if (loading) return <div>Carregando pedidos de exame...</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;
  if (exames.length === 0) return <div>Nenhum pedido de exame encontrado.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Meus Pedidos de Exame</h2>
      <ul className="space-y-4">
        {exames.map((exame) => (
          <li key={exame.id} className="border rounded p-4">
            <div><b>Título:</b> {exame.title}</div>
            <div><b>Emitido em:</b> {new Date(exame.issued_at).toLocaleString()}</div>
            <div><b>Assinado:</b> {exame.is_signed ? 'Sim' : 'Não'}</div>
            <div><b>Arquivo:</b> {exame.file_path ? <a href={exame.file_path} target="_blank" rel="noopener noreferrer">Download</a> : '-'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PedidosExamePaciente;