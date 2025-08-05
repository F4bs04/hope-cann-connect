
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Clock } from 'lucide-react';
import { getAvailabilityText, getAvailabilityColor } from "@/utils/doctorUtils";
import { formatCurrency } from "@/utils/formatters";

// Doctor type definition
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  availability: string[];
  consultationFee?: number;
}

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="h-52 relative overflow-hidden">
        <img 
          src={doctor.image} 
          alt={doctor.name} 
          className="w-full h-full object-cover object-top" 
          onError={e => {
            e.currentTarget.src = '/placeholder.svg';
          }} 
        />
        <div className="absolute top-2 right-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getAvailabilityColor(doctor.availability)}`}>
            <Clock size={14} />
            {getAvailabilityText(doctor.availability)}
          </span>
        </div>
      </div>
      <CardContent className="flex-grow pt-6">
        <h3 className="text-xl font-semibold mb-1">{doctor.name}</h3>
        <p className="text-hopecann-teal mb-3">{doctor.specialty}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-medium text-primary">
            {formatCurrency(doctor.consultationFee || 0)}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-3">{doctor.bio}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Link 
          to={`/medico/${doctor.id}`} 
          className="block w-full py-2 px-4 bg-hopecann-teal hover:bg-hopecann-teal/90 text-white text-center rounded-md transition-colors"
        >
          Ver Perfil
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;
