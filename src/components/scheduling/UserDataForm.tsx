
import React from 'react';
import { User } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  symptoms: string;
  previous_treatments: string;
}

interface UserDataFormProps {
  formData: FormData;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const UserDataForm = ({ formData, handleFormChange, onSubmit, onBack }: UserDataFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <User className="text-hopecann-teal" />
        Seus Dados
      </h2>
      
      <div className="space-y-4 mb-8">
        <div>
          <label htmlFor="name" className="block text-gray-700 mb-1">Nome Completo *</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
            value={formData.name}
            onChange={handleFormChange}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
              value={formData.email}
              onChange={handleFormChange}
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-gray-700 mb-1">Telefone/WhatsApp *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
              value={formData.phone}
              onChange={handleFormChange}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="symptoms" className="block text-gray-700 mb-1">Principais Sintomas/Queixas *</label>
          <textarea
            id="symptoms"
            name="symptoms"
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
            value={formData.symptoms}
            onChange={handleFormChange}
          />
        </div>
        
        <div>
          <label htmlFor="previous_treatments" className="block text-gray-700 mb-1">Tratamentos Anteriores</label>
          <textarea
            id="previous_treatments"
            name="previous_treatments"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
            value={formData.previous_treatments}
            onChange={handleFormChange}
          />
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-50"
          onClick={onBack}
        >
          Voltar
        </button>
        <button
          type="submit"
          className="bg-hopecann-teal text-white px-6 py-2 rounded-full"
        >
          Finalizar Agendamento
        </button>
      </div>
    </form>
  );
};

export default UserDataForm;
