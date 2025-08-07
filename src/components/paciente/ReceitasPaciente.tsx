import React, { useEffect } from 'react';
import { usePatientDocuments } from '@/hooks/usePatientDocuments';

const ReceitasPaciente: React.FC = () => {
  const { prescriptions, isLoading, error, fetchPrescriptions } = usePatientDocuments();

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  if (isLoading) return <div>Carregando receitas...</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;
  if (prescriptions.length === 0) return <div>Nenhuma receita encontrada.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Minhas Receitas</h2>
      <ul className="space-y-4">
        {prescriptions.map((receita) => (
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