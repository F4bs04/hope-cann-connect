import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, Search, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import DoctorFilters from '../components/DoctorFilters';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Mock doctor data with additional fields for filtering
const doctorsData = [
  {
    id: 1,
    name: "Dr. Ricardo Silva",
    specialty: "Neurologista",
    photo: "/lovable-uploads/12b5d4e6-afb3-43a3-9045-b53345c241b6.png",
    bio: "Especialista em tratamentos canábicos para distúrbios neurológicos, com mais de 15 anos de experiência clínica. Formado pela USP com residência em Neurologia pela UNIFESP.",
    credentials: [
      "Membro da Sociedade Brasileira de Neurologia",
      "Especialização em Canabinoides e Sistema Nervoso",
      "Pesquisador na área de epilepsia refratária"
    ],
    quote: "Acredito no poder da medicina canábica como uma alternativa eficaz para pacientes que não respondem aos tratamentos convencionais.",
    state: "SP",
    availability: ["today", "this-week", "next-week"]
  },
  {
    id: 2,
    name: "Dra. Ana Santos",
    specialty: "Psiquiatra",
    photo: "/lovable-uploads/5601622e-b421-4257-8c29-4be5a45ae10f.png",
    bio: "Especializada em tratamentos para ansiedade e depressão com abordagem integrativa. Formada pela UFRJ com residência em Psiquiatria pelo Instituto de Psiquiatria da USP.",
    credentials: [
      "Membro da Associação Brasileira de Psiquiatria",
      "Mestrado em Neurociências",
      "Especialização em Cannabis Medicinal para Transtornos Mentais"
    ],
    quote: "Minha abordagem combina a psiquiatria tradicional com os avanços da medicina canábica, buscando sempre o melhor resultado para cada paciente.",
    state: "RJ",
    availability: ["this-week", "next-week"]
  },
  {
    id: 3,
    name: "Dr. Carlos Mendes",
    specialty: "Neurologista",
    photo: "/lovable-uploads/31b21e55-c292-47fb-888b-f884e7027019.png",
    bio: "Especialista em epilepsia e doenças neurodegenerativas, com foco em tratamentos inovadores. Formado pela UNICAMP com doutorado em Neurologia Clínica.",
    credentials: [
      "Membro da Academia Brasileira de Neurologia",
      "Pesquisador clínico em canabinoides para doenças neurológicas",
      "Coordenador do Centro de Tratamento Avançado em Epilepsia"
    ],
    quote: "Vejo diariamente como o tratamento canábico pode transformar a vida de pacientes com condições neurológicas complexas.",
    state: "SP",
    availability: ["next-week"]
  },
  {
    id: 4,
    name: "Dra. Mariana Costa",
    specialty: "Clínica Geral",
    photo: "/lovable-uploads/906d320d-17b6-4919-8bd3-30ecf3d226e7.png",
    bio: "Médica com foco em medicina integrativa e tratamentos personalizados para dor crônica. Formada pela UFMG com especialização em Cannabis Medicinal.",
    credentials: [
      "Certificação Internacional em Endocanabinologia",
      "Especialista em Dor Crônica",
      "Membro da Sociedade Brasileira para Estudo da Dor"
    ],
    quote: "A cannabis medicinal não é uma solução mágica, mas quando bem prescrita, pode trazer qualidade de vida para muitos pacientes.",
    state: "MG",
    availability: ["today", "this-week"]
  },
  {
    id: 5,
    name: "Dr. Paulo Oliveira",
    specialty: "Reumatologista",
    photo: "/lovable-uploads/4c61ba35-b917-48df-a2d5-424e22a77db2.png",
    bio: "Especialista em tratamentos para doenças autoimunes e dor crônica. Formado pela UFBA com especialização em Cannabis Medicinal pela Universidade de Tel Aviv.",
    credentials: [
      "Membro da Sociedade Brasileira de Reumatologia",
      "Pesquisador em terapias alternativas para doenças reumáticas",
      "Coordenador do Centro de Dor Crônica"
    ],
    quote: "Os canabinoides têm mostrado resultados promissores para pacientes com doenças reumáticas que não respondem a tratamentos convencionais.",
    state: "BA",
    availability: ["today", "this-week"]
  },
  {
    id: 6,
    name: "Dra. Laura Pereira",
    specialty: "Neurologista Pediátrica",
    photo: "/lovable-uploads/34122bd7-3398-483c-91bf-6d0c1a1ca29c.png",
    bio: "Especialista em epilepsia infantil e distúrbios neurológicos em crianças. Formada pela USP com especialização em Cannabis Medicinal Pediátrica.",
    credentials: [
      "Membro da Sociedade Brasileira de Neurologia Pediátrica",
      "Pesquisadora em epilepsia refratária infantil",
      "Coordenadora do Núcleo de Cannabis Medicinal Pediátrica"
    ],
    quote: "O tratamento com cannabis tem sido revolucionário para muitas famílias de crianças com epilepsia refratária.",
    state: "SP",
    availability: ["this-week", "next-week"]
  }
];

// Extract unique specialties for filtering
const specialties = [...new Set(doctorsData.map(doctor => doctor.specialty))];

const Medicos = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredDoctors, setFilteredDoctors] = useState(doctorsData);
  const [filters, setFilters] = useState({
    searchTerm: '',
    specialty: '',
    state: '',
    availability: 'any'
  });
  
  const itemsPerPage = 3;
  
  useEffect(() => {
    // Apply filters to doctors data
    let results = doctorsData;
    
    // Filter by search term (name)
    if (filters.searchTerm) {
      results = results.filter(doctor => 
        doctor.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    
    // Filter by specialty
    if (filters.specialty) {
      results = results.filter(doctor => doctor.specialty === filters.specialty);
    }
    
    // Filter by state
    if (filters.state) {
      results = results.filter(doctor => doctor.state === filters.state);
    }
    
    // Filter by availability
    if (filters.availability !== 'any') {
      results = results.filter(doctor => 
        doctor.availability.includes(filters.availability)
      );
    }
    
    setFilteredDoctors(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters]);
  
  // Get current doctors
  const indexOfLastDoctor = currentPage * itemsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const getAvailabilityText = (availabilityArray) => {
    if (availabilityArray.includes('today')) {
      return 'Disponível hoje';
    } else if (availabilityArray.includes('this-week')) {
      return 'Disponível esta semana';
    } else {
      return 'Disponível próxima semana';
    }
  };
  
  const getAvailabilityColor = (availabilityArray) => {
    if (availabilityArray.includes('today')) {
      return 'text-green-600 bg-green-50';
    } else if (availabilityArray.includes('this-week')) {
      return 'text-blue-600 bg-blue-50';
    } else {
      return 'text-orange-600 bg-orange-50';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Banner Principal */}
        <section className="bg-hopecann-teal/10 py-16">
          <div className="hopecann-container">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Nossa Equipe Médica</h1>
            <p className="text-xl text-center text-gray-700 max-w-3xl mx-auto mb-8">
              Conheça os especialistas que estão revolucionando vidas através do tratamento canábico personalizado e humanizado
            </p>
          </div>
        </section>
        
        {/* Filters and Doctor Listing */}
        <section className="py-16">
          <div className="hopecann-container">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar with filters */}
              <div className="lg:w-1/4">
                <DoctorFilters 
                  specialties={specialties} 
                  onFilterChange={handleFilterChange} 
                />
              </div>
              
              {/* Main content with doctors */}
              <div className="lg:w-3/4">
                {currentDoctors.length > 0 ? (
                  <div className="space-y-8">
                    {currentDoctors.map((doctor) => (
                      <div key={doctor.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row">
                        <div className="md:w-1/3 h-64 md:h-auto">
                          <img 
                            src={doctor.photo} 
                            alt={doctor.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="p-6 md:w-2/3">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                              <h2 className="text-2xl font-bold">{doctor.name}</h2>
                              <p className="text-hopecann-teal">{doctor.specialty}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getAvailabilityColor(doctor.availability)}`}>
                                <Clock size={14} />
                                {getAvailabilityText(doctor.availability)}
                              </span>
                              
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
                                <MapPin size={14} />
                                {doctor.state}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-6 line-clamp-3">
                            {doctor.bio}
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <Link 
                              to={`/medicos/${doctor.id}`} 
                              className="text-hopecann-teal hover:text-hopecann-teal/80 font-medium"
                            >
                              Ver perfil completo
                            </Link>
                            
                            <Link 
                              to="/agendar" 
                              className="inline-flex items-center gap-2 bg-hopecann-teal text-white hover:bg-hopecann-teal/90 px-4 py-2 rounded-full transition-colors"
                            >
                              <Calendar size={16} />
                              <span>Agendar Consulta</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Pagination className="mt-8">
                        <PaginationContent>
                          {currentPage > 1 && (
                            <PaginationItem>
                              <PaginationPrevious 
                                href="#" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(currentPage - 1);
                                }} 
                              />
                            </PaginationItem>
                          )}
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink 
                                href="#" 
                                isActive={page === currentPage}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(page);
                                }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          
                          {currentPage < totalPages && (
                            <PaginationItem>
                              <PaginationNext 
                                href="#" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(currentPage + 1);
                                }}
                              />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <Search className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-xl font-medium mb-2">Nenhum médico encontrado</h3>
                    <p className="text-gray-600 mb-4">
                      Não encontramos médicos com os filtros selecionados. Tente ajustar seus critérios de busca.
                    </p>
                    <button 
                      onClick={() => setFilters({
                        searchTerm: '',
                        specialty: '',
                        state: '',
                        availability: 'any'
                      })}
                      className="text-hopecann-teal hover:text-hopecann-teal/80 font-medium"
                    >
                      Limpar todos os filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Chamada para ação */}
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
