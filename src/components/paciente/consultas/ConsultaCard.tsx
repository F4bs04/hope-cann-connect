
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ConsultaCardProps {
  consulta: any;
  onReagendar: (id: string) => void;
  onCancelar: (id: string) => void;
}

export function ConsultaCard({ consulta, onReagendar, onCancelar }: ConsultaCardProps) {
  return (
    <Card key={consulta.id} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className={`w-full md:w-2 p-0 md:p-0 ${
            consulta.status === 'scheduled' ? 'bg-primary' : 
            consulta.status === 'completed' ? 'bg-green-500' : 
            'bg-destructive'
          }`}></div>
          <div className="p-4 flex-1">
            <div className="flex justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-semibold truncate">{consulta.doctors?.profiles?.full_name || 'Médico não especificado'}</h3>
                <p className="text-sm text-gray-600 truncate">{consulta.doctors?.specialty || 'Especialidade não especificada'}</p>
              </div>
              <Badge className={
                consulta.status === 'scheduled' ? 'bg-primary/10 text-primary' :
                consulta.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-destructive/10 text-destructive'
              }>
                {consulta.status === 'scheduled' ? 'Agendada' : 
                 consulta.status === 'completed' ? 'Realizada' : 
                 consulta.status === 'cancelled' ? 'Cancelada' : consulta.status}
              </Badge>
            </div>
            
            {consulta.reason && (
              <p className="text-sm text-gray-700 mt-2 truncate">{consulta.reason}</p>
            )}
            
            {consulta.fee && (
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Taxa:</strong> R$ {consulta.fee.toFixed(2)}
              </p>
            )}
            
            <div className="mt-3 flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{format(new Date(consulta.scheduled_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
              <Clock className="h-4 w-4 ml-3 mr-1 flex-shrink-0" />
              <span>{format(new Date(consulta.scheduled_at), "HH:mm", { locale: ptBR })}</span>
            </div>
            
            {consulta.status === 'scheduled' && (
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
                  className="text-destructive border-destructive/20 hover:bg-destructive/10"
                  onClick={() => onCancelar(consulta.id)}
                >
                  Cancelar
                </Button>
              </div>
            )}
            
            {consulta.status === 'completed' && (
              <div className="mt-3 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
                <span className="text-sm text-green-600 truncate">
                  Consulta realizada com sucesso
                </span>
              </div>
            )}
            
            {consulta.status === 'cancelled' && (
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
