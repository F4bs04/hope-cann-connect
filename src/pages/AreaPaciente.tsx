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
import ChatsPacienteList from '@/components/paciente/ChatsList';
import ChatPaciente from '@/components/paciente/ChatPaciente';
import { MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AreaPacienteProps {
  initialSection?: string;
}

const AreaPaciente: React.FC<AreaPacienteProps> = ({ initialSection = 'dashboard' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(initialSection);
  const { paciente, loading: pacienteLoading } = usePacienteAuth();
  const [selectedPacienteChat, setSelectedPacienteChat] = useState<any | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sectionParam = params.get('section');
    if (sectionParam) {
      setCurrentSection(sectionParam);
    } else {
      setCurrentSection(initialSection);
    }
    setSelectedPacienteChat(null); 
  }, [initialSection, location.search]);


  if (pacienteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  const pacienteId = paciente?.id || 0;

  const handleSelectPacienteChat = (chatData: any) => {
    setSelectedPacienteChat(chatData);
  };

  const handleBackFromPacienteChat = () => {
    setSelectedPacienteChat(null);
  };
  
  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    setSelectedPacienteChat(null);
    navigate(`/area-paciente?section=${section}`, { replace: true });
  };

  const renderSection = () => {
    console.log('[AreaPaciente] Rendering section:', currentSection, "Selected Paciente Chat:", selectedPacienteChat, "Paciente ID:", pacienteId);
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
      case 'chat':
        if (!pacienteId) return <p>Informações do paciente não carregadas. Tente novamente.</p>;
        
        if (selectedPacienteChat) {
          return (
            <ChatPaciente
              pacienteId={pacienteId}
              medicoId={selectedPacienteChat.medicos?.id}
              medicoNome={selectedPacienteChat.medicos?.nome || 'Médico'}
              medicoEspecialidade={selectedPacienteChat.medicos?.especialidade || ''}
              medicoFoto={selectedPacienteChat.medicos?.foto_perfil}
              onBack={handleBackFromPacienteChat}
            />
          );
        }
        return (
          <ChatsPacienteList
            pacienteId={pacienteId}
            onSelectChat={handleSelectPacienteChat}
          />
        );
      default:
        return <PacienteDashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PacienteSidebar
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
        />

        <div className="flex flex-col flex-1 overflow-y-auto">
          <PacienteHeader pacienteNome={paciente?.nome} />
          
          <SidebarInset className="bg-gray-50 flex-1">
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
