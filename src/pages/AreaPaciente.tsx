
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import PacienteHeader from "@/components/paciente/PacienteHeader";
import { PacienteSidebar } from '@/components/area-paciente/PacienteSidebar';
import PacienteDashboard from '@/components/area-paciente/PacienteDashboard';
import ConsultasPaciente from '@/components/paciente/ConsultasPaciente';
import ReceitasPaciente from '@/components/paciente/ReceitasPaciente';
import AtestadosPaciente from '@/components/paciente/AtestadosPaciente';
import LaudosPaciente from '@/components/paciente/LaudosPaciente';
import PedidosExamePaciente from '@/components/paciente/PedidosExamePaciente';
import MedicosPaciente from '@/components/paciente/MedicosPaciente';
import PacientePerfilDetalhes from '@/components/area-paciente/PacientePerfilDetalhes'; // Nova importação
import { usePacienteAuth } from '@/hooks/usePacienteAuth';

interface AreaPacienteProps {
  initialSection?: string;
}

const AreaPaciente: React.FC<AreaPacienteProps> = ({ initialSection = 'dashboard' }) => {
  const [currentSection, setCurrentSection] = useState(initialSection);
  const { paciente, loading } = usePacienteAuth();
  
  useEffect(() => {
    if (initialSection) {
      setCurrentSection(initialSection);
    }
  }, [initialSection]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  const pacienteId = paciente?.id || 0; // Usado por outros componentes

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <PacienteDashboard />;
      case 'consultas':
        return <ConsultasPaciente pacienteId={pacienteId} />;
      case 'receitas':
        return <ReceitasPaciente pacienteId={pacienteId} />;
      case 'atestados':
        return <AtestadosPaciente pacienteId={pacienteId} />;
      case 'laudos':
        return <LaudosPaciente pacienteId={pacienteId} />;
      case 'pedidos-exame':
        return <PedidosExamePaciente pacienteId={pacienteId} />;
      case 'medicos':
        return <MedicosPaciente pacienteId={pacienteId} />;
      case 'perfil':
        // Substituído o placeholder pelo novo componente
        return <PacientePerfilDetalhes paciente={paciente} />;
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
            <main className="w-full h-full p-4 md:p-6 lg:p-8 animate-fade-in"> {/* Ajustado padding */}
              {renderSection()}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default AreaPaciente;
