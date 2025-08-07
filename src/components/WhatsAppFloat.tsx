import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppFloat = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const whatsappUrl = "https://wa.me/558179008621?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20consulta";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap animate-fade-in">
            Agende pelo nosso WhatsApp
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
        
        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="relative w-16 h-16 rounded-full border-3 border-blue-500 overflow-hidden shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl bg-green-500 flex items-center justify-center">
            {/* WhatsApp Icon */}
            <img
              src="/whatsapp-icon.ico"
              alt="WhatsApp"
              className="w-10 h-10"
            />
          </div>
        </a>
      </div>
    </div>
  );
};

export default WhatsAppFloat;