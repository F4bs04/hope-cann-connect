
import React from 'react';
import { PrescriptionData } from '@/types/prescription';

interface PrescriptionPrintTemplateProps {
  data: PrescriptionData | null;
}

const PrescriptionPrintTemplate: React.FC<PrescriptionPrintTemplateProps> = ({ data }) => {
  if (!data) {
    return null; // Or a placeholder if needed, but Prescricoes.tsx should handle null data
  }

  const { doctor, patient, prescriptionDate, medications, generalInstructions, prescriptionNumber } = data;

  const formatDate = (dateString: string) => {
    // Assuming dateString is 'yyyy-MM-dd' from date input, or already 'dd/MM/yyyy'
    if (!dateString) return '';
    if (dateString.includes('-')) { // yyyy-MM-dd
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateString; // Already in dd/MM/yyyy or other format
  };

  return (
    <div className="printable-prescription font-serif text-black bg-white">
      {/* Cabeçalho */}
      <header className="mb-6 pb-4 border-b border-gray-300">
        <div className="flex justify-between items-start">
          <div className="w-2/3">
            {doctor.clinicLogoUrl && <img src={doctor.clinicLogoUrl} alt="Logo da Clínica" className="max-h-20 mb-2"/>}
            <h1 className="text-2xl font-bold mb-1">{doctor.clinicName}</h1>
            <p className="text-sm">Dr(a). {doctor.name}</p>
            <p className="text-sm">CRM: {doctor.crm} - {doctor.specialty}</p>
            {doctor.clinicAddress && <p className="text-xs">{doctor.clinicAddress}</p>}
            {doctor.phone && <p className="text-xs">Tel: {doctor.phone}</p>}
          </div>
          <div className="w-1/3 text-right">
            <p className="text-lg font-semibold">RECEITUÁRIO MÉDICO</p>
            <p className="text-sm">Nº: {prescriptionNumber}</p>
          </div>
        </div>
      </header>

      {/* Dados do Paciente */}
      <section className="mb-6 pb-4 border-b border-gray-300">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase text-gray-600">Paciente:</p>
            <p className="font-semibold">{patient.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-600">CPF:</p>
            <p>{patient.cpf}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-600">Data de Nascimento:</p>
            <p>{formatDate(patient.birthDate)}</p>
          </div>
          {patient.address && (
            <div>
              <p className="text-xs uppercase text-gray-600">Endereço:</p>
              <p>{patient.address}</p>
            </div>
          )}
           {patient.phone && (
            <div>
              <p className="text-xs uppercase text-gray-600">Telefone:</p>
              <p>{patient.phone}</p>
            </div>
          )}
        </div>
      </section>

      {/* Medicamentos - Usando "USO INTERNO" ou "USO EXTERNO/TÓPICO" etc. */}
      <section className="mb-6">
        <h2 className="text-center font-bold text-lg mb-3 uppercase">Prescrição</h2>
        {medications.map((med, index) => (
          <div key={med.id || index} className="medication-item mb-4 pl-2">
            <p className="font-semibold text-md">{index + 1}. {med.name} {med.dosage}</p>
            <p className="ml-4 text-sm">Quantidade: {med.quantity}</p>
            <p className="ml-4 text-sm">Instruções (Posologia): {med.instructions}</p>
          </div>
        ))}
        {medications.length === 0 && <p className="text-gray-500 text-center">Nenhum medicamento prescrito.</p>}
      </section>

      {/* Orientações Gerais */}
      {generalInstructions && (
        <section className="mb-8 pt-4 border-t border-gray-300">
          <h2 className="font-semibold uppercase mb-1 text-sm">Orientações Gerais:</h2>
          <p className="text-sm whitespace-pre-wrap">{generalInstructions}</p>
        </section>
      )}

      {/* Rodapé */}
      <footer className="mt-12 pt-8 border-t-2 border-gray-400">
        <div className="flex justify-between items-end">
          <div className="text-sm">
            <p>Data da Emissão: {formatDate(prescriptionDate)}</p>
            <div className="mt-16 w-64 border-t border-black mx-auto"></div>
            <p className="text-center mt-1">Dr(a). {doctor.name}</p>
            <p className="text-center">CRM: {doctor.crm}</p>
          </div>
          <div className="text-xs text-gray-600">
            {/* Considerar adicionar validade da receita se aplicável e definido */}
            <p>Carimbo e Assinatura do Médico</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrescriptionPrintTemplate;
