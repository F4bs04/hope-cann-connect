import React, { useEffect, useState } from 'react';
import { usePatientDocuments } from '@/hooks/usePatientDocuments';

const LaudosPaciente: React.FC = () => {
  const [laudos, setLaudos] = useState<any[]>([]);
  const { isLoading, error, fetchReports } = usePatientDocuments();

  useEffect(() => {
    const loadReports = async () => {
      const data = await fetchReports();
      setLaudos(data);
    };
    loadReports();
  }, [fetchReports]);

  if (isLoading) return <div>Carregando laudos...</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;
  if (laudos.length === 0) return <div>Nenhum laudo encontrado.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Meus Laudos</h2>
      <ul className="space-y-4">
        {laudos.map((laudo) => (
          <li key={laudo.id} className="border rounded p-4">
            <div><b>Título:</b> {laudo.title}</div>
            <div><b>Emitido em:</b> {new Date(laudo.issued_at).toLocaleString()}</div>
            <div><b>Assinado:</b> {laudo.is_signed ? 'Sim' : 'Não'}</div>
            <div><b>Arquivo:</b> {laudo.file_path ? <a href={laudo.file_path} target="_blank" rel="noopener noreferrer">Download</a> : '-'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LaudosPaciente;