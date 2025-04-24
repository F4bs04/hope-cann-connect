
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ConsultasEmpty() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <Calendar className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Nenhuma consulta encontrada</h3>
        <p className="text-gray-500 mb-4">
          Você ainda não possui consultas registradas.
        </p>
        <Button onClick={() => window.location.href = '/agendar'}>
          Agendar nova consulta
        </Button>
      </CardContent>
    </Card>
  );
}
