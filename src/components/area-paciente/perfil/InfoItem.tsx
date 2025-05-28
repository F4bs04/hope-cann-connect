
import React from 'react';

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value }) => {
  if (!value && value !== '') return null; 
  return (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-hopecann-teal mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-gray-800">{value || 'Não informado'}</p>
      </div>
    </div>
  );
};

export default InfoItem;
