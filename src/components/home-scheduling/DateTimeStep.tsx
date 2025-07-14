
import React from 'react';
import DateTimeSelection from '@/components/scheduling/DateTimeSelection';

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
    <DateTimeSelection
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      setSelectedDate={setSelectedDate}
      setSelectedTime={setSelectedTime}
      onNext={onNext}
      onBack={onBack}
      doctorId={doctorId}
    />
  );
};
