import React, { useState, useEffect } from 'react';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarInset
} from '@/components/ui/sidebar';
import {
  Home,
  Calendar,
  ClipboardList,
  FileText,
  Users,
  Activity,
  FilePenLine,
  FileSignature,
  FileCheck,
  User,
  Clock,
  MessageCircle,
  DollarSign
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Components
import DashboardHome from '@/components/medico-dashboard/DashboardHome';
import AgendaMedica from '@/components/medico-dashboard/AgendaMedica';
import Prescricoes from '@/components/medico-dashboard/Prescricoes';
import Prontuarios from '@/components/medico-dashboard/Prontuarios';
import Pacientes from '@/components/medico-dashboard/Pacientes';
import Atestados from '@/components/medico-dashboard/Atestados';
import Receitas from '@/components/medico-dashboard/Receitas';
import Laudos from '@/components/medico-dashboard/Laudos';
import PedidosExame from '@/components/medico-dashboard/PedidosExame';
import ConsultaView from '@/components/medico-dashboard/ConsultaView';
import ProntuarioAba from '@/components/medico/ProntuarioAba';
import AgendaSlotsManager from '@/components/medico/AgendaSlotsManager';
import ClinicaDashboard from '@/components/clinica-dashboard/ClinicaDashboard';
import ConfiguracoesFinanceiras from '@/components/medico-dashboard/ConfiguracoesFinanceiras';
import EditProfileDialog from '@/components/medico/EditProfileDialog';
import MedicoHeader from '@/components/medico/MedicoHeader';
import ChatsList from '@/components/medico/ChatsList';
import ChatMedico from '@/components/medico/ChatMedico';

// Contexts and Hooks
import { DoctorScheduleProvider } from '@/contexts/DoctorScheduleContext';
import { MedicoNavigationProvider, useMedicoNavigation } from '@/contexts/MedicoNavigationContext';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';
import { DashboardSkeleton } from '@/components/medico/LoadingStates';

const AreaMedicoContent: React.FC = () => {
  const location = useLocation();
  const { 
    currentSection, 
    selectedPatientId, 
    selectedConsultaId, 
    navigateToSection,
    setSelectedPatient,
    setSelectedConsulta 
  } = useMedicoNavigation();
  
  const { isLoading: authLoading, isAuthenticated, isMedico } = useUnifiedAuth();
  const { userInfo, loading } = useCurrentUserInfo();
  const [showProntuarioAba, setShowProntuarioAba] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [medicoUserId, setMedicoUserId] = useState<number | null>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);

  useEffect(() => {
    console.log('=== AREA MEDICO DEBUG ===');
    console.log('authLoading:', authLoading);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('isMedico:', isMedico);
    console.log('currentSection:', currentSection);
  }, [authLoading, isAuthenticated, isMedico, currentSection]);

  // Load URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const pacienteParam = params.get('paciente');
    
    if (tabParam && tabParam !== currentSection) {
      navigateToSection(tabParam);
    }
    
    if (pacienteParam && tabParam === 'prontuarios') {
      const patientId = parseInt(pacienteParam);
      if (!isNaN(patientId)) {
        setSelectedPatient(patientId);
        setShowProntuarioAba(true);
      }
    }
  }, [location, currentSection, navigateToSection, setSelectedPatient]);

  useEffect(() => {
    const storedType = localStorage.getItem('userType');
    setUserType(storedType);
    console.log('Stored user type:', storedType);
  }, []);

  const handleOpenConsulta = (consultaId: number) => {
    setSelectedConsulta(consultaId);
    navigateToSection('consulta');
  };

  const handleOpenPatient = (patientId: string | number) => {
    const patientIdNumber = typeof patientId === 'string' ? parseInt(patientId) : patientId;
    setSelectedPatient(patientIdNumber);
    setShowProntuarioAba(true);
    navigateToSection('prontuario');
  };

  const handleBackFromProntuario = () => {
    setShowProntuarioAba(false);
    setSelectedPatient(null);
    navigateToSection('prontuarios');
  };

  const handleBackToSection = (section: string) => {
    setSelectedConsulta(null);
    navigateToSection(section);
  };

  // Loading state
  if (authLoading) {
    console.log('Showing loading state');
    return <DashboardSkeleton />;
  }

  // Authentication check
  if (!isAuthenticated || !isMedico) {
    console.log('Access denied - not authenticated or not medico');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso não autorizado</h2>
          <p className="text-gray-600">Você precisa estar logado como médico para acessar esta área.</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Debug info:</p>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>Is Medico: {isMedico ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering main content');

  const renderSection = () => {
    if (showProntuarioAba) {
      return <ProntuarioAba onBack={handleBackFromProntuario} />;
    }

    switch (currentSection) {
      case 'dashboard':
        return <DashboardHome onOpenConsulta={handleOpenConsulta} />;
      case 'dashboard-clinica':
        return <ClinicaDashboard />;
      case 'agenda':
        return <AgendaMedica />;
      case 'slots':
        return <AgendaSlotsManager />;
      case 'prescricoes':
        return <Prescricoes />;
      case 'prontuarios':
        return <Prontuarios onSelectPatient={(id: string) => handleOpenPatient(parseInt(id))} />;
      case 'pacientes':
        return <Pacientes onSelectPatient={handleOpenPatient} />;
      case 'atestados':
        return <Atestados />;
      case 'receitas':
        return <Receitas />;
      case 'laudos':
        return <Laudos />;
      case 'pedidos-exame':
        return <PedidosExame />;
      case 'consulta':
        return selectedConsultaId ? (
          <ConsultaView 
            consultaId={selectedConsultaId} 
            onBack={() => handleBackToSection('dashboard')} 
          />
        ) : null;
      case 'chat':
        return selectedChat ? (
          <div>Chat temporariamente desabilitado</div>
        ) : (
          <div>Lista de chats temporariamente desabilitado</div>
        );
      case 'financeiro':
        return <ConfiguracoesFinanceiras />;
      default:
        return <DashboardHome onOpenConsulta={handleOpenConsulta} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="bg-[#00B3B0] text-white">
          <SidebarHeader className="p-4">
            <h2 className="text-xl font-bold">HopeCann</h2>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('dashboard')}
                  isActive={currentSection === 'dashboard'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <Home className="w-5 h-5 mr-2" /> Área Médica
                </SidebarMenuButton>
              </SidebarMenuItem>

              {userType === 'clinica' && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => navigateToSection('dashboard-clinica')}
                    isActive={currentSection === 'dashboard-clinica'}
                    className="text-white hover:bg-[#009E9B]"
                  >
                    <span className="mr-2 inline-flex items-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor">
                        <use href="#lucide-layout-dashboard" />
                      </svg>
                    </span>
                    Dashboard Clínica
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('agenda')}
                  isActive={currentSection === 'agenda'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <Calendar className="w-5 h-5 mr-2" /> Agenda
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('slots')}
                  isActive={currentSection === 'slots'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <Clock className="w-5 h-5 mr-2" /> Gerenciar Slots
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('pacientes')}
                  isActive={currentSection === 'pacientes'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <Users className="w-5 h-5 mr-2" /> Pacientes
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('prontuarios')}
                  isActive={currentSection === 'prontuarios'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <ClipboardList className="w-5 h-5 mr-2" /> Prontuários
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('prescricoes')}
                  isActive={currentSection === 'prescricoes'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <FileText className="w-5 h-5 mr-2" /> Prescrições
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('receitas')}
                  isActive={currentSection === 'receitas'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <FilePenLine className="w-5 h-5 mr-2" /> Receitas
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('atestados')}
                  isActive={currentSection === 'atestados'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <FileCheck className="w-5 h-5 mr-2" /> Atestados
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('laudos')}
                  isActive={currentSection === 'laudos'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <FileSignature className="w-5 h-5 mr-2" /> Laudos
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('pedidos-exame')}
                  isActive={currentSection === 'pedidos-exame'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <Activity className="w-5 h-5 mr-2" /> Pedidos de Exame
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('financeiro')}
                  isActive={currentSection === 'financeiro'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <DollarSign className="w-5 h-5 mr-2" /> Painel Financeiro
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('chat')}
                  isActive={currentSection === 'chat'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <MessageCircle className="w-5 h-5 mr-2" /> Chat com Pacientes
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-4 mt-auto">
            <SidebarMenuButton className="text-white hover:bg-[#009E9B]" onClick={() => setShowProfileDialog(true)}>
              <User className="w-5 h-5 mr-2" /> Meu Perfil
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="bg-gray-50 flex-1">
          <MedicoHeader />
          <main className="w-full h-full p-8">
            {renderSection()}
            {/* EditProfileDialog temporarily disabled */}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const AreaMedico: React.FC = () => {
  return (
    <DoctorScheduleProvider>
      <MedicoNavigationProvider>
        <AreaMedicoContent />
      </MedicoNavigationProvider>
    </DoctorScheduleProvider>
  );
};

export default AreaMedico;
