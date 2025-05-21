
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DoctorInfo, PatientInfo, MedicationItem, PrescriptionData } from '@/types/prescription';
import { PlusCircle, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface PrescriptionFormProps {
  onSubmit: (data: PrescriptionData) => void;
  initialData?: Partial<PrescriptionData>;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ onSubmit, initialData }) => {
  const [doctor, setDoctor] = useState<DoctorInfo>(initialData?.doctor || { name: '', crm: '', specialty: '', clinicName: '' });
  const [patient, setPatient] = useState<PatientInfo>(initialData?.patient || { name: '', cpf: '', birthDate: '' });
  const [medications, setMedications] = useState<MedicationItem[]>(initialData?.medications || [{ id: uuidv4(), name: '', dosage: '', quantity: '', instructions: '' }]);
  const [generalInstructions, setGeneralInstructions] = useState(initialData?.generalInstructions || '');
  const [prescriptionNumber, setPrescriptionNumber] = useState(initialData?.prescriptionNumber || `REC-${new Date().getFullYear()}-001`); // Basic example

  const handleMedicationChange = (index: number, field: keyof MedicationItem, value: string) => {
    const newMedications = [...medications];
    (newMedications[index] as any)[field] = value;
    setMedications(newMedications);
  };

  const addMedication = () => {
    setMedications([...medications, { id: uuidv4(), name: '', dosage: '', quantity: '', instructions: '' }]);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation (can be expanded)
    if (!doctor.name || !doctor.crm || !patient.name || !patient.cpf || medications.some(m => !m.name)) {
      alert('Por favor, preencha todos os campos obrigatórios do médico, paciente e medicamentos.');
      return;
    }
    onSubmit({
      doctor,
      patient,
      medications,
      generalInstructions,
      prescriptionDate: new Date().toLocaleDateString('pt-BR'),
      prescriptionNumber,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader><CardTitle>Dados do Médico</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="docName">Nome do Médico*</Label><Input id="docName" value={doctor.name} onChange={(e) => setDoctor({ ...doctor, name: e.target.value })} required /></div>
            <div><Label htmlFor="docCrm">CRM*</Label><Input id="docCrm" value={doctor.crm} onChange={(e) => setDoctor({ ...doctor, crm: e.target.value })} required /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="docSpecialty">Especialidade*</Label><Input id="docSpecialty" value={doctor.specialty} onChange={(e) => setDoctor({ ...doctor, specialty: e.target.value })} required /></div>
            <div><Label htmlFor="clinicName">Nome da Clínica*</Label><Input id="clinicName" value={doctor.clinicName} onChange={(e) => setDoctor({ ...doctor, clinicName: e.target.value })} required /></div>
          </div>
          <div><Label htmlFor="clinicAddress">Endereço da Clínica</Label><Input id="clinicAddress" value={doctor.clinicAddress || ''} onChange={(e) => setDoctor({ ...doctor, clinicAddress: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle>Dados do Paciente</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="patientName">Nome do Paciente*</Label><Input id="patientName" value={patient.name} onChange={(e) => setPatient({ ...patient, name: e.target.value })} required /></div>
            <div><Label htmlFor="patientCpf">CPF*</Label><Input id="patientCpf" value={patient.cpf} onChange={(e) => setPatient({ ...patient, cpf: e.target.value })} required /></div>
          </div>
          <div><Label htmlFor="patientBirthDate">Data de Nascimento*</Label><Input type="date" id="patientBirthDate" value={patient.birthDate} onChange={(e) => setPatient({ ...patient, birthDate: e.target.value })} required /></div>
          <div><Label htmlFor="patientAddress">Endereço do Paciente</Label><Input id="patientAddress" value={patient.address || ''} onChange={(e) => setPatient({ ...patient, address: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle>Medicamentos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {medications.map((med, index) => (
            <div key={med.id} className="p-4 border rounded-md space-y-3 relative">
              <button type="button" onClick={() => removeMedication(med.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
              <div><Label htmlFor={`medName-${med.id}`}>Nome do Medicamento*</Label><Input id={`medName-${med.id}`} value={med.name} onChange={(e) => handleMedicationChange(index, 'name', e.target.value)} required /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor={`medDosage-${med.id}`}>Dosagem</Label><Input id={`medDosage-${med.id}`} value={med.dosage} onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)} /></div>
                <div><Label htmlFor={`medQuantity-${med.id}`}>Quantidade</Label><Input id={`medQuantity-${med.id}`} value={med.quantity} onChange={(e) => handleMedicationChange(index, 'quantity', e.target.value)} /></div>
              </div>
              <div><Label htmlFor={`medInstructions-${med.id}`}>Posologia/Instruções*</Label><Textarea id={`medInstructions-${med.id}`} value={med.instructions} onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)} required /></div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addMedication} className="mt-2">
            <PlusCircle size={16} className="mr-2" /> Adicionar Medicamento
          </Button>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader><CardTitle>Orientações Gerais e Nº da Receita</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="generalInstructions">Orientações Gerais</Label><Textarea id="generalInstructions" value={generalInstructions} onChange={(e) => setGeneralInstructions(e.target.value)} /></div>
          <div><Label htmlFor="prescriptionNumber">Número da Receita*</Label><Input id="prescriptionNumber" value={prescriptionNumber} onChange={(e) => setPrescriptionNumber(e.target.value)} required /></div>
        </CardContent>
      </Card>

      <CardFooter>
        <Button type="submit" size="lg">Gerar Preview da Receita</Button>
      </CardFooter>
    </form>
  );
};

export default PrescriptionForm;

