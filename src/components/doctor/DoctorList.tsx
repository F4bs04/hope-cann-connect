
import React from 'react';
import DoctorCard, { Doctor } from './DoctorCard';
import EmptyDoctorState from './EmptyDoctorState';

interface DoctorListProps {
  doctors: Doctor[];
  isLoading: boolean;
  onSelectDoctor: (id: number) => void;
  onClearFilters: () => void;
  selectedDoctor?: number | null;
}

const DoctorList = ({ doctors, isLoading, onSelectDoctor, onClearFilters, selectedDoctor }: DoctorListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hopecann-teal"></div>
      </div>
    );
  }

  if (doctors.length === 0) {
    return <EmptyDoctorState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {doctors.map(doctor => (
        <DoctorCard 
          key={doctor.id} 
          doctor={doctor} 
          onSelect={onSelectDoctor}
          isSelected={selectedDoctor === doctor.id}
        />
      ))}
    </div>
  );
};

export default DoctorList;
