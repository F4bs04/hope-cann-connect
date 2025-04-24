import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import PacienteHeader from "@/components/paciente/PacienteHeader";
import { PacienteSidebar } from '@/components/area-paciente/PacienteSidebar';
import PacienteDashboard from '@/components/area-paciente/PacienteDashboard';
import ConsultasPaciente from '@/components/paciente/ConsultasPaciente';
import ReceitasPaciente from '@/components/paciente/ReceitasPaciente';
import { usePacienteAuth } from '@/hooks/usePacienteAuth';

const AreaPaciente: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const { paciente, loading } = usePacienteAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <PacienteDashboard />;
      case 'consultas':
        return <ConsultasPaciente />;
      case 'receitas':
        return <ReceitasPaciente />;
      case 'atestados':
        return <AtestadosPaciente pacienteId={paciente?.id} />;
      case 'laudos':
        return <LaudosPaciente pacienteId={paciente?.id} />;
      case 'pedidos-exame':
        return <PedidosExamePaciente pacienteId={paciente?.id} />;
      case 'medicos':
        return <MedicosPaciente pacienteId={paciente?.id} />;
      default:
        return <PacienteDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PacienteHeader pacienteNome={paciente?.nome} />
      <div className="flex flex-1">
        <SidebarProvider>
          <PacienteSidebar
            currentSection={currentSection}
            onSectionChange={setCurrentSection}
          />
          <SidebarInset className="bg-gray-50 flex-1">
            <main className="w-full h-full p-6 md:p-8 animate-fade-in">
              {renderSection()}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default AreaPaciente;
