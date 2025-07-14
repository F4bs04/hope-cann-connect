
import React from 'react';
import AgendarConsultaPaciente from '@/components/paciente/AgendarConsultaPaciente';

interface DateTimeStepProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
  doctorId?: number | null;
}

export const DateTimeStep: React.FC<DateTimeStepProps> = ({
  selectedDate,
  selectedTime,
  setSelectedDate,
  setSelectedTime,
  onNext,
  onBack,
  doctorId
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Agendar Consulta</h2>
      <AgendarConsultaPaciente
        selectedDoctorId={doctorId}
        onSuccess={onNext}
      />
    </div>
  );
};
