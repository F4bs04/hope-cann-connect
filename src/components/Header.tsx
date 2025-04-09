
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, PhoneCall } from 'lucide-react';

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

  return <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-4'}`}>
      <div className="hopecann-container flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img alt="Clínica HopeCann Logo" className="h-10" src="/lovable-uploads/4c61ba35-b917-48df-a2d5-424e22a77db2.png" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" isActive={location.pathname === '/'} isScrolled={isScrolled}>
            Início
          </NavLink>
          <NavLink to="/tratamentos" isActive={location.pathname === '/tratamentos'} isScrolled={isScrolled}>
            Tratamentos
          </NavLink>
          <NavLink to="/medicos" isActive={location.pathname === '/medicos'} isScrolled={isScrolled}>
            Médicos
          </NavLink>
          <NavLink to="/contato" isActive={location.pathname === '/contato'} isScrolled={isScrolled}>
            Contato
          </NavLink>
          
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-gray-200">
            <PhoneCall className="h-4 w-4 text-hopecann-teal" />
            <span className={`font-medium ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
              (11) 99999-9999
            </span>
          </div>
          
          <Link to="/agendar" className={`${isScrolled ? 'bg-hopecann-green hover:bg-hopecann-teal text-white' : 'bg-hopecann-green hover:bg-hopecann-teal text-white'} font-medium py-2.5 px-6 rounded-full transition-all shadow-sm`}>
            Agendar Consulta
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button className={`md:hidden ${isScrolled ? 'text-gray-700' : 'text-white'}`} onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && <div className="md:hidden bg-white shadow-lg py-6 absolute top-full left-0 right-0 animate-fade-in">
          <div className="hopecann-container flex flex-col space-y-6">
            <MobileNavLink to="/" isActive={location.pathname === '/'} onClick={() => setIsMenuOpen(false)}>
              Início
            </MobileNavLink>
            <MobileNavLink to="/tratamentos" isActive={location.pathname === '/tratamentos'} onClick={() => setIsMenuOpen(false)}>
              Tratamentos
            </MobileNavLink>
            <MobileNavLink to="/medicos" isActive={location.pathname === '/medicos'} onClick={() => setIsMenuOpen(false)}>
              Médicos
            </MobileNavLink>
            <MobileNavLink to="/contato" isActive={location.pathname === '/contato'} onClick={() => setIsMenuOpen(false)}>
              Contato
            </MobileNavLink>
            
            <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-hopecann-teal" />
              <span className="font-medium text-gray-700">
                (11) 99999-9999
              </span>
            </div>
            
            <Link to="/agendar" className="bg-hopecann-green hover:bg-hopecann-teal text-white font-medium py-3 px-6 rounded-full transition-all w-full text-center" onClick={() => setIsMenuOpen(false)}>
              Agendar Consulta
            </Link>
          </div>
        </div>}
    </header>;
};

const NavLink = ({
  to,
  children,
  isActive,
  isScrolled
}) => <Link to={to} className={`font-medium transition-colors ${isActive ? 'text-hopecann-teal' : isScrolled ? 'text-hopecann-green hover:text-hopecann-teal' : 'text-white hover:text-white/80'}`}>
    {children}
  </Link>;

const MobileNavLink = ({
  to,
  children,
  isActive,
  onClick
}) => <Link to={to} className={`font-medium transition-colors ${isActive ? 'text-hopecann-teal' : 'text-hopecann-green hover:text-hopecann-teal'}`} onClick={onClick}>
    {children}
  </Link>;

export default Header;
