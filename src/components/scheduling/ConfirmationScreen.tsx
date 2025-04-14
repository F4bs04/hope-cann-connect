
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarCheck, Clock, User } from 'lucide-react';

interface ConfirmationScreenProps {
  selectedDoctor: any;
  selectedDate: Date | null;
  selectedTime: string | null;
}

const ConfirmationScreen = ({ selectedDoctor, selectedDate, selectedTime }: ConfirmationScreenProps) => {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-hopecann-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CalendarCheck className="h-8 w-8 text-hopecann-teal" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Agendamento Concluído!</h2>
      <p className="text-gray-700 mb-8 max-w-lg mx-auto">
        Sua consulta foi agendada com sucesso. Em breve você receberá um e-mail e um WhatsApp com a confirmação e detalhes da sua consulta.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="font-semibold mb-4">Resumo do Agendamento</h3>
        
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <User className="text-hopecann-teal h-5 w-5" />
            <div>
              <p className="text-sm text-gray-500">Médico</p>
              <p className="font-medium">{selectedDoctor?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="text-hopecann-teal h-5 w-5" />
            <div>
              <p className="text-sm text-gray-500">Data</p>
              <p className="font-medium">
                {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ""}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="text-hopecann-teal h-5 w-5" />
            <div>
              <p className="text-sm text-gray-500">Horário</p>
              <p className="font-medium">{selectedTime}</p>
            </div>
          </div>
          
          <div className="pt-3 border-t mt-3">
            <p className="text-sm text-gray-500">Tipo de Consulta</p>
            <p className="font-medium">Primeira Consulta</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
