
import React from 'react';
import { Link } from 'react-router-dom';
import { useDoctors } from '@/hooks/useDoctors';
import DoctorsSectionHeader from './doctors/DoctorsSectionHeader';
import DoctorsGrid from './doctors/DoctorsGrid';

const DoctorsSection = () => {
  const { doctors, isLoading, dbStatus } = useDoctors();
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="hopecann-container">
        <DoctorsSectionHeader dbStatus={dbStatus} />
        
        <DoctorsGrid doctors={doctors} isLoading={isLoading} />
        
        <div className="text-center mt-12">
          <Link 
            to="/medicos" 
            className="inline-flex items-center justify-center gap-2 bg-white text-hopecann-teal hover:bg-gray-100 border border-hopecann-teal px-6 py-3 rounded-md transition-colors"
          >
            Ver Todos os Médicos
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;
