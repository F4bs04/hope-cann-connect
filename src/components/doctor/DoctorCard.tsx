
import React from 'react';
import { Clock } from 'lucide-react';
import { getAvailabilityText, getAvailabilityColor } from "@/utils/doctorUtils";

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  availability: string[];
}

interface DoctorCardProps {
  doctor: Doctor;
  onSelect: (id: number) => void;
}

const DoctorCard = ({ doctor, onSelect }: DoctorCardProps) => {
  return (
    <div
      key={doctor.id}
      className="p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors border-gray-200 hover:border-hopecann-teal/50"
      onClick={() => onSelect(doctor.id)}
    >
      <div className="flex flex-col xs:flex-row items-center xs:items-start gap-3 sm:gap-4">
        <div className="w-20 h-20 xs:w-16 xs:h-16 rounded-full overflow-hidden flex-shrink-0">
          <img 
            src={doctor.image || '/placeholder.svg'} 
            alt={doctor.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
        <div className="flex-1 text-center xs:text-left w-full">
          <div className="flex flex-col xs:flex-row justify-between items-center xs:items-start">
            <div>
              <h3 className="font-medium text-base sm:text-lg">{doctor.name}</h3>
              <p className="text-xs sm:text-sm text-hopecann-teal mb-1">{doctor.specialty}</p>
            </div>
            <span 
              className={`mt-1 xs:mt-0 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getAvailabilityColor(doctor.availability)}`}
            >
              <Clock size={12} />
              {getAvailabilityText(doctor.availability)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1 xs:mt-0">{doctor.bio}</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
