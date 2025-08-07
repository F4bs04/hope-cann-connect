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
          <div className="relative w-16 h-16 rounded-full border-3 border-blue-500 overflow-hidden shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl animate-pulse">
            {/* Profile Image */}
            <img
              src="/lovable-uploads/517435b1-124e-44c4-bedc-bf12a451edcc.png"
              alt="Atendente WhatsApp"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback para ícone do WhatsApp se a imagem não carregar
                const target = e.currentTarget as HTMLImageElement;
                const fallback = target.nextElementSibling as HTMLElement;
                target.style.display = 'none';
                fallback.style.display = 'flex';
              }}
            />
            
            {/* Fallback WhatsApp Icon */}
            <div className="absolute inset-0 bg-green-500 flex items-center justify-center" style={{ display: 'none' }}>
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            
            {/* WhatsApp Icon Overlay */}
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <MessageCircle className="w-3 h-3 text-white" />
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default WhatsAppFloat;