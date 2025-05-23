
import React from 'react';
import DoctorCard, { Doctor } from './DoctorCard';
import { Skeleton } from "@/components/ui/skeleton";

interface DoctorsGridProps {
  doctors: Doctor[];
  isLoading: boolean;
}

// Loading skeleton for doctors
const DoctorCardSkeleton = () => (
  <div className="flex flex-col rounded-xl overflow-hidden border border-gray-200">
    <Skeleton className="h-52 w-full" />
    <div className="p-6">
      <Skeleton className="h-7 w-3/4 mb-2" />
      <Skeleton className="h-5 w-1/2 mb-5" />
      <Skeleton className="h-16 w-full mb-6" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

const DoctorsGrid = ({ doctors, isLoading }: DoctorsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DoctorCardSkeleton />
        <DoctorCardSkeleton />
        <DoctorCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </div>
  );
};

export default DoctorsGrid;
