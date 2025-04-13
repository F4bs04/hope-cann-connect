
import React from 'react';
import { Clock } from 'lucide-react';
import { getAvailabilityText, getAvailabilityColor } from "@/utils/doctorUtils";

// Doctor type definition
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
      className="p-4 border rounded-lg cursor-pointer transition-colors border-gray-200 hover:border-hopecann-teal/50"
      onClick={() => onSelect(doctor.id)}
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
          <img 
            src={doctor.image} 
            alt={doctor.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{doctor.name}</h3>
              <p className="text-sm text-hopecann-teal mb-1">{doctor.specialty}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getAvailabilityColor(doctor.availability)}`}>
              <Clock size={12} />
              {getAvailabilityText(doctor.availability)}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
