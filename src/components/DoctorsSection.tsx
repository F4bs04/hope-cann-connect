
import React from 'react';
import { Link } from 'react-router-dom';

const doctorsData = [
  {
    name: 'Dr. Ricardo Silva',
    specialty: 'Neurologista',
    bio: 'Especialista em tratamentos canábicos para distúrbios neurológicos.',
    image: '/lovable-uploads/12b5d4e6-afb3-43a3-9045-b53345c241b6.png'
  },
  {
    name: 'Dra. Ana Santos',
    specialty: 'Psiquiatra',
    bio: 'Especializada em tratamentos para ansiedade e depressão.',
    image: '/lovable-uploads/5601622e-b421-4257-8c29-4be5a45ae10f.png'
  },
  {
    name: 'Dr. Carlos Mendes',
    specialty: 'Neurologista',
    bio: 'Especialista em epilepsia e doenças neurodegenerativas.',
    image: '/lovable-uploads/31b21e55-c292-47fb-888b-f884e7027019.png'
  }
];

const DoctorCard = ({ name, specialty, bio, image }) => {
  return (
    <div className="hopecann-card p-0 overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-1">{name}</h3>
        <p className="text-hopecann-teal mb-3">{specialty}</p>
        <p className="text-gray-600 mb-4">{bio}</p>
        <Link 
          to="/agendar" 
          className="block w-full py-2 px-4 bg-hopecann-teal hover:bg-hopecann-teal/90 text-white text-center rounded-md transition-colors"
        >
          Agendar Consulta
        </Link>
      </div>
    </div>
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
      </div>
    </section>
  );
};

export default DoctorsSection;
