import React, { useEffect, useState } from 'react';
import 'react/jsx-runtime';
import { usePatientDocuments } from '@/hooks/usePatientDocuments';

const AtestadosPaciente: React.FC = () => {
  const [atestados, setAtestados] = useState<any[]>([]);
  const { isLoading, error, fetchCertificates } = usePatientDocuments();

  useEffect(() => {
    const loadCertificates = async () => {
      const data = await fetchCertificates();
      setAtestados(data);
    };
    loadCertificates();
  }, [fetchCertificates]);

  if (isLoading) return <div>Carregando atestados...</div>;
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