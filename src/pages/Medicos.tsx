import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import DoctorFilters from '../components/DoctorFilters';
import DoctorSearch from '../components/DoctorSearch';
import { useNavigate } from 'react-router-dom';
import { useDoctors } from '@/hooks/useDoctors';

const Medicos = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const navigate = useNavigate();
  const { doctors, isLoading, dbStatus } = useDoctors();
  
  const handleSelectDoctor = (id: number) => {
    setSelectedDoctor(id);
    navigate(`/medico/${id}`);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-hopecann-teal/10 py-16">
          <div className="hopecann-container">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Nossa Equipe Médica</h1>
            <p className="text-xl text-center text-gray-700 max-w-3xl mx-auto mb-8">
              Conheça os especialistas que estão revolucionando vidas através do tratamento canábico personalizado e humanizado
            </p>
          </div>
        </section>
        
        <section className="py-16">
          <div className="hopecann-container">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/4">
                <DoctorFilters />
              </div>
              
              <div className="lg:w-3/4">
                <DoctorSearch 
                  onSelectDoctor={handleSelectDoctor} 
                  initialDoctors={doctors}
                  isInitialLoading={isLoading}
                  selectedDoctor={selectedDoctor}
                />
              </div>
            </div>
          </div>
        </section>
        
        <section className="bg-gray-50 py-16">
          <div className="hopecann-container text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Receba o Cuidado que Você Merece</h2>
              <p className="text-xl text-gray-700 mb-8">
                Nossa equipe médica especializada está pronta para oferecer uma avaliação personalizada e um plano de tratamento adequado às suas necessidades.
              </p>
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                <Link 
                  to="/agendar" 
                  className="inline-flex items-center justify-center gap-2 bg-hopecann-teal text-white hover:bg-hopecann-teal/90 px-8 py-3 rounded-full transition-colors text-lg"
                >
                  <Calendar size={20} />
                  <span>Agendar Consulta</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Medicos;
