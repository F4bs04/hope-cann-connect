
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Function to scroll to the scheduling section on the homepage
  const scrollToScheduling = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const schedulingSection = document.querySelector('.HomeScheduling');
      if (schedulingSection) {
        schedulingSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = '/#scheduling';
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-4'}`}>
      <div className="hopecann-container flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/9826141f-2e80-41ba-8792-01e2ed93ac69.png" 
              alt="Clínica HopeCann Logo" 
              className="h-10" 
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink 
            to="/" 
            isActive={location.pathname === '/'} 
            isScrolled={isScrolled}
          >
            Início
          </NavLink>
          <NavLink 
            to="/tratamentos" 
            isActive={location.pathname === '/tratamentos'} 
            isScrolled={isScrolled}
          >
            Tratamentos
          </NavLink>
          <NavLink 
            to="/medicos" 
            isActive={location.pathname === '/medicos'} 
            isScrolled={isScrolled}
          >
            Médicos
          </NavLink>
          <NavLink 
            to="/contato" 
            isActive={location.pathname === '/contato'} 
            isScrolled={isScrolled}
          >
            Contato
          </NavLink>
          
          <Link 
            to="/"
            onClick={scrollToScheduling}
            className="bg-hopecann-green hover:bg-hopecann-teal text-white font-medium py-2.5 px-6 rounded-full transition-all shadow-sm"
          >
            Agendar Consulta
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className={`md:hidden ${isScrolled ? 'text-gray-700' : 'text-white'}`} 
          onClick={toggleMenu} 
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-6 absolute top-full left-0 right-0 animate-fade-in">
          <div className="hopecann-container flex flex-col space-y-6">
            <MobileNavLink 
              to="/" 
              isActive={location.pathname === '/'} 
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </MobileNavLink>
            <MobileNavLink 
              to="/tratamentos" 
              isActive={location.pathname === '/tratamentos'} 
              onClick={() => setIsMenuOpen(false)}
            >
              Tratamentos
            </MobileNavLink>
            <MobileNavLink 
              to="/medicos" 
              isActive={location.pathname === '/medicos'} 
              onClick={() => setIsMenuOpen(false)}
            >
              Médicos
            </MobileNavLink>
            <MobileNavLink 
              to="/contato" 
              isActive={location.pathname === '/contato'} 
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </MobileNavLink>
            
            <Link 
              to="/"
              onClick={(e) => {
                setIsMenuOpen(false);
                scrollToScheduling(e);
              }}
              className="bg-hopecann-green hover:bg-hopecann-teal text-white font-medium py-3 px-6 rounded-full transition-all w-full text-center"
            >
              Agendar Consulta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ to, children, isActive, isScrolled }) => (
  <Link
    to={to}
    className={`font-medium transition-colors ${
      isActive 
        ? 'text-hopecann-teal' 
        : isScrolled 
          ? 'text-hopecann-green hover:text-hopecann-teal' 
          : 'text-hopecann-green hover:text-hopecann-teal'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, children, isActive, onClick }) => (
  <Link
    to={to}
    className={`font-medium transition-colors ${
      isActive ? 'text-hopecann-teal' : 'text-hopecann-green hover:text-hopecann-teal'
    }`}
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Header;
