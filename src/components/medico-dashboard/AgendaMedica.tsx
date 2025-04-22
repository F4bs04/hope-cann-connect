import React from 'react';
import { DoctorScheduleProvider } from '@/contexts/DoctorScheduleContext';
import AgendaTab from '@/components/medico/AgendaTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AgendaMedica: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Agenda Médica</h1>
      <DoctorScheduleProvider>
        <Tabs defaultValue="consultas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="consultas">Consultas</TabsTrigger>
            <TabsTrigger value="configurar">Configurar Horários</TabsTrigger>
          </TabsList>
          <TabsContent value="consultas">
            <div className="space-y-4">
              <h2>Minhas Consultas</h2>
              {/* Componente de listagem de consultas */}
            </div>
          </TabsContent>
          <TabsContent value="configurar">
            <AgendaTab />
          </TabsContent>
        </Tabs>
      </DoctorScheduleProvider>
    </div>
  );
};

export default AgendaMedica;
