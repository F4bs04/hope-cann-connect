
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Instagram, Facebook, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-hopecann-green text-white pt-12 pb-6 bg-teal-500">
      <div className="hopecann-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <img alt="Clínica HopeCann Logo" className="h-12" src="/lovable-uploads/a5f96bd2-0443-4cbb-81e8-170c5b8eb2b1.png" />
            </div>
            <p className="text-white/90 mb-4">
              Tratamento canábico<br />
              personalizado e humanizado
            </p>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/sobre-nos" className="text-white/90 hover:text-white transition">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/tratamentos" className="text-white/90 hover:text-white transition">
                  Tratamentos
                </Link>
              </li>
              <li>
                <Link to="/medicos" className="text-white/90 hover:text-white transition">
                  Médicos
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/90 hover:text-white transition">
                  Perguntas Frequentes {/* Novo Link */}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/90 hover:text-white transition">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-center md:justify-start space-x-3">
                <Phone size={18} />
                <span>99999-9999</span>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-3">
                <Mail size={18} />
                <span>contato@hopecann.com</span>
              </li>
            </ul>
            
            <h3 className="text-lg font-semibold mt-6 mb-3">Redes Sociais</h3>
            <div className="flex space-x-4 justify-center md:justify-start">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="hover:text-white/80 transition" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="hover:text-white/80 transition" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="hover:text-white/80 transition" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-6 text-center text-sm text-white/70">
          <p>© 2025 HopeCann. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
