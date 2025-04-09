
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-hopecann-teal text-white py-4">
      <div className="hopecann-container flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/lovable-uploads/906d320d-17b6-4919-8bd3-30ecf3d226e7.png"
              alt="Clínica HopeCann Logo"
              className="h-10"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="font-medium hover:text-white/80 transition">
            Início
          </Link>
          <Link to="/tratamentos" className="font-medium hover:text-white/80 transition">
            Tratamentos
          </Link>
          <Link to="/medicos" className="font-medium hover:text-white/80 transition">
            Médicos
          </Link>
          <Link to="/contato" className="font-medium hover:text-white/80 transition">
            Contato
          </Link>
          <Link 
            to="/agendar" 
            className="bg-hopecann-green hover:bg-hopecann-green/90 text-white font-medium py-2 px-6 rounded-full transition-all"
          >
            Agendar Consulta
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-hopecann-teal border-t border-white/10 py-4">
          <div className="hopecann-container flex flex-col space-y-4">
            <Link 
              to="/" 
              className="font-medium hover:text-white/80 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </Link>
            <Link 
              to="/tratamentos" 
              className="font-medium hover:text-white/80 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Tratamentos
            </Link>
            <Link 
              to="/medicos" 
              className="font-medium hover:text-white/80 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Médicos
            </Link>
            <Link 
              to="/contato" 
              className="font-medium hover:text-white/80 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </Link>
            <Link 
              to="/agendar" 
              className="bg-hopecann-green hover:bg-hopecann-green/90 text-white font-medium py-2 px-6 rounded-full transition-all w-full text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Agendar Consulta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
