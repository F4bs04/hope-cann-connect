
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const doctorsData = [
  {
    name: 'Dr. Samuel Rodrigo',
    specialty: 'Neurologista',
    bio: 'Especialista em tratamentos canábicos para distúrbios neurológicos.',
    image: '/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png'
  },
  {
    name: 'Dra. Ana Santos',
    specialty: 'Psiquiatra',
    bio: 'Especializada em tratamentos para ansiedade e depressão.',
    image: '/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png'
  },
  {
    name: 'Dr. Carlos Mendes',
    specialty: 'Neurologista',
    bio: 'Especialista em epilepsia e doenças neurodegenerativas.',
    image: '/lovable-uploads/8e0e4c0d-f012-449c-9784-9be7170458f5.png'
  }
];

const DoctorCard = ({ name, specialty, bio, image }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="h-52 relative overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </div>
      <CardContent className="flex-grow pt-6">
        <h3 className="text-xl font-semibold mb-1">{name}</h3>
        <p className="text-hopecann-teal mb-3">{specialty}</p>
        <p className="text-gray-600 mb-4">{bio}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Link 
          to={`/medico/${name.replace(/Dr\.|Dra\.\s+/g, '').trim()}`}
          className="block w-full py-2 px-4 bg-hopecann-teal hover:bg-hopecann-teal/90 text-white text-center rounded-md transition-colors"
        >
          Ver Perfil
        </Link>
      </CardFooter>
    </Card>
  );
};

const DoctorsSection = () => {
  return (
    <section className="hopecann-section py-16 md:py-24">
      <div className="hopecann-container">
        <h2 className="hopecann-section-title">Nossa Equipe Médica</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {doctorsData.map((doctor, index) => (
            <DoctorCard
              key={index}
              name={doctor.name}
              specialty={doctor.specialty}
              bio={doctor.bio}
              image={doctor.image}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link
            to="/medicos"
            className="inline-flex items-center justify-center rounded-full bg-white border border-hopecann-teal text-hopecann-teal px-6 py-3 hover:bg-hopecann-teal/5 transition-colors"
          >
            Ver todos os médicos
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;
