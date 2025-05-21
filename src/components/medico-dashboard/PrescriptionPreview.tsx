
import React from 'react';
import { PrescriptionData } from '@/types/prescription';

interface PrescriptionPreviewProps {
  data: PrescriptionData | null;
}

const PrescriptionPreview: React.FC<PrescriptionPreviewProps> = ({ data }) => {
  if (!data) {
    return <div className="p-4 text-center text-gray-500">Preencha o formulário para visualizar a receita.</div>;
  }

  const { doctor, patient, prescriptionDate, medications, generalInstructions, prescriptionNumber } = data;

  return (
    <div id="prescription-preview" className="p-6 border rounded-lg shadow-lg bg-white font-serif text-sm max-w-2xl mx-auto">
      {/* Cabeçalho */}
      <header className="mb-6 border-b pb-4">
        <div className="flex justify-between items-start">
          <div>
            {doctor.clinicLogoUrl && <img src={doctor.clinicLogoUrl} alt="Logo da Clínica" className="h-16 mb-2"/>}
            <h1 className="text-xl font-bold">{doctor.clinicName}</h1>
            <p>Dr(a). {doctor.name} - CRM: {doctor.crm}</p>
            <p>{doctor.specialty}</p>
            {doctor.clinicAddress && <p>{doctor.clinicAddress}</p>}
          </div>
          <div className="text-right">
            <p className="font-semibold">RECEITA MÉDICA</p>
            <p>Nº: {prescriptionNumber}</p>
          </div>
        </div>
      </header>

      {/* Dados do Paciente */}
      <section className="mb-6">
        <h2 className="font-semibold mb-1">Paciente:</h2>
        <p>{patient.name}</p>
        <p>CPF: {patient.cpf}</p>
        <p>Data de Nascimento: {patient.birthDate ? new Date(patient.birthDate + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</p>
        {patient.address && <p>Endereço: {patient.address}</p>}
      </section>

      {/* Medicamentos */}
      <section className="mb-6">
        <h2 className="font-semibold uppercase mb-2">Medicamentos:</h2>
        {medications.map((med, index) => (
          <div key={med.id || index} className="mb-3 pl-4 border-l-2 border-gray-200">
            <p className="font-medium">{index + 1}. {med.name} {med.dosage} - {med.quantity}</p>
            <p className="text-xs text-gray-700">Uso: {med.instructions}</p>
          </div>
        ))}
        {medications.length === 0 && <p className="text-gray-500">Nenhum medicamento prescrito.</p>}
      </section>

      {/* Orientações Gerais */}
      {generalInstructions && (
        <section className="mb-6">
          <h2 className="font-semibold uppercase mb-1">Orientações Gerais:</h2>
          <p className="whitespace-pre-wrap">{generalInstructions}</p>
        </section>
      )}

      {/* Rodapé */}
      <footer className="mt-10 pt-6 border-t">
        <div className="flex justify-between items-end">
          <div>
            <p>Data: {prescriptionDate}</p>
            <p className="mt-10">_________________________________________</p>
            <p className="font-semibold">Dr(a). {doctor.name}</p>
            <p>CRM: {doctor.crm}</p>
          </div>
          <div className="text-xs text-gray-500">
            Validade da Receita: (Definir conforme legislação)
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrescriptionPreview;

