
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, User, Stethoscope } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [session, setSession] = useState(null);
  const [userType, setUserType] = useState(null);
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

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserType(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          fetchUserType(session.user.id);
        } else {
          setUserType(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserType = async (userId) => {
    try {
      // First check if user is a doctor
      const { data: medico } = await supabase
        .from('medicos')
        .select('id')
        .eq('id_usuario', userId)
        .single();

      if (medico) {
        setUserType('medico');
        return;
      }

      // If not a doctor, check if user is a patient
      const { data: paciente } = await supabase
        .from('pacientes')
        .select('id')
        .eq('id_usuario', userId)
        .single();

      if (paciente) {
        setUserType('paciente');
        return;
      }

      // Default to paciente if user type is not determined
      setUserType('paciente');
    } catch (error) {
      console.error('Error fetching user type:', error);
      // Default to paciente on error
      setUserType('paciente');
    }
  };

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
          
          {session ? (
            userType === 'medico' ? (
              <Link 
                to="/area-medico"
                className="bg-hopecann-green hover:bg-hopecann-teal text-white font-medium py-2.5 px-6 rounded-full transition-all shadow-sm flex items-center gap-2"
              >
                <Stethoscope size={18} />
                Área do Médico
              </Link>
            ) : (
              <Link 
                to="/area-paciente"
                className="bg-hopecann-green hover:bg-hopecann-teal text-white font-medium py-2.5 px-6 rounded-full transition-all shadow-sm flex items-center gap-2"
              >
                <User size={18} />
                Área do Paciente
              </Link>
            )
          ) : (
            <Link 
              to="/login"
              className="bg-hopecann-green hover:bg-hopecann-teal text-white font-medium py-2.5 px-6 rounded-full transition-all shadow-sm flex items-center gap-2"
            >
              <LogIn size={18} />
              Login
            </Link>
          )}
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
            
            {session ? (
              userType === 'medico' ? (
                <Link 
                  to="/area-medico"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-hopecann-green hover:bg-hopecann-teal text-white font-medium py-3 px-6 rounded-full transition-all w-full text-center flex items-center justify-center gap-2"
                >
                  <Stethoscope size={18} />
                  Área do Médico
                </Link>
              ) : (
                <Link 
                  to="/area-paciente"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-hopecann-green hover:bg-hopecann-teal text-white font-medium py-3 px-6 rounded-full transition-all w-full text-center flex items-center justify-center gap-2"
                >
                  <User size={18} />
                  Área do Paciente
                </Link>
              )
            ) : (
              <Link 
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="bg-hopecann-green hover:bg-hopecann-teal text-white font-medium py-3 px-6 rounded-full transition-all w-full text-center flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                Login
              </Link>
            )}
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
