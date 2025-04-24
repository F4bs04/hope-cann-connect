
import React from 'react';
import { ConsultaCard } from './ConsultaCard';
import { ConsultasEmpty } from './ConsultasEmpty';
import { Loader2 } from 'lucide-react';

interface ConsultasListProps {
  consultas: any[];
  loading: boolean;
  onReagendar: (id: number) => void;
  onCancelar: (id: number) => void;
}

export function ConsultasList({ consultas, loading, onReagendar, onCancelar }: ConsultasListProps) {
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin text-hopecann-teal" />
      </div>
    );
  }

  if (consultas.length === 0) {
    return <ConsultasEmpty />;
  }

  return (
    <div className="space-y-4">
      {consultas.map(consulta => (
        <ConsultaCard
          key={consulta.id}
          consulta={consulta}
          onReagendar={onReagendar}
          onCancelar={onCancelar}
        />
      ))}
    </div>
  );
}
