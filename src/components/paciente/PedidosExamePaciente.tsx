import React, { useEffect, useState } from 'react';
import { usePatientDocuments } from '@/hooks/usePatientDocuments';

const PedidosExamePaciente: React.FC = () => {
  const [exames, setExames] = useState<any[]>([]);
  const { isLoading, error, fetchExamRequests } = usePatientDocuments();

  useEffect(() => {
    const loadExamRequests = async () => {
      const data = await fetchExamRequests();
      setExames(data);
    };
    loadExamRequests();
  }, [fetchExamRequests]);

  if (isLoading) return <div>Carregando pedidos de exame...</div>;
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