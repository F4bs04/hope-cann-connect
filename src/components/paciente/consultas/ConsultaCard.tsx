
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ConsultaCardProps {
  consulta: any;
  onReagendar: (id: number) => void;
  onCancelar: (id: number) => void;
}

export function ConsultaCard({ consulta, onReagendar, onCancelar }: ConsultaCardProps) {
  return (
    <Card key={consulta.id} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className={`w-full md:w-2 p-0 md:p-0 ${
            consulta.status === 'agendada' ? 'bg-blue-500' : 
            consulta.status === 'realizada' ? 'bg-green-500' : 
            'bg-red-500'
          }`}></div>
          <div className="p-4 flex-1">
            <div className="flex justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-semibold truncate">{consulta.medicos?.nome || 'Médico não especificado'}</h3>
                <p className="text-sm text-gray-600 truncate">{consulta.medicos?.especialidade || 'Especialidade não especificada'}</p>
              </div>
              <Badge className={
                consulta.status === 'agendada' ? 'bg-blue-100 text-blue-800' :
                consulta.status === 'realizada' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }>
                {consulta.status.charAt(0).toUpperCase() + consulta.status.slice(1)}
              </Badge>
            </div>
            
            {consulta.motivo && (
              <p className="text-sm text-gray-700 mt-2 truncate">{consulta.motivo}</p>
            )}
            
            <div className="mt-3 flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{format(new Date(consulta.data_hora), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
              <Clock className="h-4 w-4 ml-3 mr-1 flex-shrink-0" />
              <span>{format(new Date(consulta.data_hora), "HH:mm", { locale: ptBR })}</span>
            </div>
            
            {consulta.status === 'agendada' && (
              <div className="mt-3 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onReagendar(consulta.id)}
                >
                  Reagendar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => onCancelar(consulta.id)}
                >
                  Cancelar
                </Button>
              </div>
            )}
            
            {consulta.status === 'realizada' && (
              <div className="mt-3 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
                <span className="text-sm text-green-600 truncate">
                  Consulta realizada com sucesso
                </span>
              </div>
            )}
            
            {consulta.status === 'cancelada' && (
              <div className="mt-3 flex items-center">
                <XCircle className="h-4 w-4 text-red-500 mr-1 flex-shrink-0" />
                <span className="text-sm text-red-600 truncate">
                  Consulta cancelada
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
