
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

  const pacienteId = paciente?.id || 0;

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
        return <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6 text-hopecann-teal">Meu Perfil</h2>
          <p className="text-gray-600">Esta seção será implementada em breve.</p>
        </div>;
      default:
        return <PacienteDashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full"> {/* Envolve PacienteSidebar e a coluna de conteúdo principal */}
        
        <PacienteSidebar
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
        />

        {/* Coluna de conteúdo principal (cabeçalho + área de conteúdo) */}
        <div className="flex flex-col flex-1 overflow-y-auto"> {/* Adicionado overflow-y-auto */}
          <PacienteHeader pacienteNome={paciente?.nome} />
          
          <SidebarInset className="bg-gray-50 flex-1"> {/* flex-1 para ocupar o espaço restante */}
            <main className="w-full h-full p-6 md:p-8 animate-fade-in">
              {renderSection()}
            </main>
          </SidebarInset>
        </div>

      </div>
    </SidebarProvider>
  );
};

export default AreaPaciente;
