
import React from 'react';
import { Clock, Check } from 'lucide-react';
import { getAvailabilityText, getAvailabilityColor } from "@/utils/doctorUtils";

// Doctor type definition
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  availability: string[];
}

interface DoctorCardProps {
  doctor: Doctor;
  onSelect: (id: string) => void;
  isSelected?: boolean;
}

const DoctorCard = ({ doctor, onSelect, isSelected = false }: DoctorCardProps) => {
  return (
    <div
      key={doctor.id}
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 relative ${
        isSelected 
          ? 'border-hopecann-teal bg-hopecann-teal/5 shadow-md ring-2 ring-hopecann-teal/20' 
          : 'border-gray-200 hover:border-hopecann-teal/50 hover:shadow-sm'
      }`}
      onClick={() => onSelect(doctor.id)}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-hopecann-teal rounded-full flex items-center justify-center">
          <Check size={14} className="text-white" />
        </div>
      )}
      
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
              <h3 className={`font-medium ${isSelected ? 'text-hopecann-teal' : ''}`}>
                {doctor.name}
              </h3>
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
