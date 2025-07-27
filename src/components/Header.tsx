
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, User, Stethoscope, LogOut, BriefcaseMedical, Bell } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [session, setSession] = useState(null);
  const [userType, setUserType] = useState(null);
  const [hasNotifications, setHasNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(session);
      if (session) {
        fetchUserType(session.user.id);
      } else {
        // Check localStorage authentication
        const isLocallyAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const localUserType = localStorage.getItem('userType');
        const authTimestamp = localStorage.getItem('authTimestamp');
        
        // Check if auth is expired
        if (isLocallyAuthenticated && authTimestamp) {
          const timestamp = parseInt(authTimestamp);
          const now = Date.now();
          const authAgeDays = (now - timestamp) / (1000 * 60 * 60 * 24);
          
          if (authAgeDays <= 1) { // not expired
            // Set user type from localStorage
            if (localUserType) {
              setUserType(localUserType);
            }
          } else {
            // Clear expired authentication
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');
            localStorage.removeItem('userType');
            localStorage.removeItem('authTimestamp');
            localStorage.removeItem('userAvatar');
          }
        }
      }
    });

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserType(session.user.id);
      } else {
        // Check localStorage on auth change
        const isLocallyAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (isLocallyAuthenticated) {
          const localUserType = localStorage.getItem('userType');
          if (localUserType) {
            setUserType(localUserType);
          }
        } else {
          setUserType(null);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Check for notifications (this is a placeholder - would need to connect to real notification data)
  useEffect(() => {
    const checkNotifications = async () => {
      // This is where you would fetch actual notifications from your database
      // For now, let's just simulate having notifications for demonstration
      if (session || localStorage.getItem('isAuthenticated') === 'true') {
        setHasNotifications(false); // Set to true to show notification indicator
      }
    };
    
    checkNotifications();
    
    // You could set up a polling mechanism or real-time subscription here
    const notificationInterval = setInterval(checkNotifications, 60000); // Check every minute
    
    return () => clearInterval(notificationInterval);
  }, [session]);

  const fetchUserType = async userId => {
    try {
      // First check if user is a doctor
      const {
        data: doctor
      } = await supabase.from('doctors').select('id').eq('user_id', userId).single();
      if (doctor) {
        setUserType('medico');
        return;
      }

      // If not a doctor, check if user is a patient
      const {
        data: patient
      } = await supabase.from('patients').select('id').eq('user_id', userId).single();
      if (patient) {
        setUserType('paciente');
        return;
      }

      // Check if user is a clinic admin (check in clinics table by email)
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: clinic } = await supabase
          .from('clinics')
          .select('id')
          .eq('email', user.email)
          .single();
        
        if (clinic) {
          setUserType('admin_clinica');
          return;
        }
      }

      // Default to paciente if user type is not determined
      setUserType('paciente');
    } catch (error) {
      console.error('Error fetching user type:', error);
      // Default to paciente on error
      setUserType('paciente');
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase Auth
      await supabase.auth.signOut();
      
      // Clear localStorage auth data
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      localStorage.removeItem('authTimestamp');
      localStorage.removeItem('userAvatar');
      
      // Also clear toast flags
      localStorage.removeItem('toast-shown-auth');
      localStorage.removeItem('toast-shown-perm');
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta."
      });
      
      navigate('/');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Function to scroll to the scheduling section on the homepage
  const scrollToScheduling = e => {
    e.preventDefault();
    if (location.pathname === '/') {
      const schedulingSection = document.querySelector('.HomeScheduling');
      if (schedulingSection) {
        schedulingSection.scrollIntoView({
          behavior: 'smooth'
        });
      }
    } else {
      window.location.href = '/#scheduling';
    }
  };

  // Function to determine which area link to show based on userType
  const getUserAreaLink = () => {
    switch(userType) {
      case 'medico':
        return {
          to: "/area-medico",
          icon: <Stethoscope size={18} />,
          text: "Área do Médico"
        };
      case 'admin_clinica':
        return {
          to: "/admin",
          icon: <BriefcaseMedical size={18} />,
          text: "Área da Clínica"
        };
      default: // default is paciente
        return {
          to: "/area-paciente",
          icon: <User size={18} />,
          text: "Área do Paciente"
        };
    }
  };

  const isAuthenticated = session || localStorage.getItem('isAuthenticated') === 'true';
  const userAreaLink = getUserAreaLink();

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-4'}`}>
      <div className="hopecann-container flex justify-between items-center">
        <div className="flex items-center">
          <a href="https://hopecann.com.br" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
            <img src="/lovable-uploads/hopecann-logo.png" alt="Logo HopeCann" className="h-16 w-auto" style={{maxHeight: '64px'}} />
          </a>
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
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Link to={userAreaLink.to} className="bg-hopecann-green hover:bg-hopecann-teal text-white font-medium py-2.5 px-6 rounded-full transition-all shadow-sm flex items-center gap-2">
                {userAreaLink.icon}
                {userAreaLink.text}
              </Link>
              
              <Link to="/notificacoes" className="relative bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full transition-all">
                <Bell size={18} className="text-gray-700" />
                {hasNotifications && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </Link>
              
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-full transition-all shadow-sm flex items-center gap-2"
              >
                <LogOut size={18} />
                Sair
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-hopecann-green hover:bg-hopecann-teal text-white font-medium py-2.5 px-6 rounded-full transition-all shadow-sm flex items-center gap-2">
              <LogIn size={18} />
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className={`md:hidden ${isScrolled ? 'text-gray-700' : 'text-white'}`} onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-6 absolute top-full left-0 right-0 animate-fade-in">
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
            
            {isAuthenticated ? (
              <div className="flex flex-col space-y-3">
                <Link to={userAreaLink.to} onClick={() => setIsMenuOpen(false)} className="bg-hopecann-green hover:bg-hopecann-teal text-white font-medium py-3 px-6 rounded-full transition-all w-full text-center flex items-center justify-center gap-2">
                  {userAreaLink.icon}
                  {userAreaLink.text}
                </Link>
                
                <Link to="/notificacoes" onClick={() => setIsMenuOpen(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-full transition-all w-full text-center flex items-center justify-center gap-2">
                  <Bell size={18} />
                  Notificações
                  {hasNotifications && (
                    <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-full transition-all w-full text-center flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Sair
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-hopecann-green hover:bg-hopecann-teal text-white font-medium py-3 px-6 rounded-full transition-all w-full text-center flex items-center justify-center gap-2">
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

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
  isScrolled: boolean;
}

const NavLink = ({
  to,
  children,
  isActive,
  isScrolled
}: NavLinkProps) => <Link to={to} className={`font-medium transition-colors ${isActive ? 'text-hopecann-teal' : isScrolled ? 'text-hopecann-green hover:text-hopecann-teal' : 'text-hopecann-green hover:text-hopecann-teal'}`}>
    {children}
  </Link>;

interface MobileNavLinkProps {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const MobileNavLink = ({
  to,
  children,
  isActive,
  onClick
}: MobileNavLinkProps) => <Link to={to} className={`font-medium transition-colors ${isActive ? 'text-hopecann-teal' : 'text-hopecann-green hover:text-hopecann-teal'}`} onClick={onClick}>
    {children}
  </Link>;

export default Header;
