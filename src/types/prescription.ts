
export interface DoctorInfo {
  name: string;
  crm: string;
  specialty: string;
  clinicName: string;
  clinicAddress?: string; // Optional as per example
  phone?: string; // Optional
  clinicLogoUrl?: string; // Optional for logo
}

export interface PatientInfo {
  name: string;
  cpf: string;
  birthDate: string;
  address?: string; // Optional as per example
  phone?: string; // Optional
}

export interface MedicationItem {
  id: string; // For list key
  name: string;
  dosage: string;
  quantity: string;
  instructions: string; // Posologia
}

export interface PrescriptionData {
  doctor: DoctorInfo;
  patient: PatientInfo;
  prescriptionDate: string;
  medications: MedicationItem[];
  generalInstructions: string;
  prescriptionNumber: string;
}

