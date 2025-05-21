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
  Plus,
  User,
  MessageSquare
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

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
import { DoctorScheduleProvider } from '@/contexts/DoctorScheduleContext';
import ClinicaDashboard from '@/components/clinica-dashboard/ClinicaDashboard';
import EditProfileDialog from '@/components/medico/EditProfileDialog';
import MedicoHeader from '@/components/medico/MedicoHeader';
import ChatsList from '@/components/medico/ChatsList';
import ChatMedico from '@/components/medico/ChatMedico';
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';

const AreaMedico: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentSection, setCurrentSection] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedConsultaId, setSelectedConsultaId] = useState<number | null>(null);
  const [showProntuarioAba, setShowProntuarioAba] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [medicoUsuarioId, setMedicoUsuarioId] = useState<number | null>(null);
  const [selectedMedicoChat, setSelectedMedicoChat] = useState<any | null>(null);

  const { userInfo, loading: userInfoLoading } = useCurrentUserInfo();
  const medicoIdFromHook = userInfo.medicoId;

  useEffect(() => {
    console.log('[AreaMedico] Location or search params changed:', location.search);
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const pacienteParam = params.get('paciente');
    const chatIdParam = params.get('chatId');

    if (tabParam) {
      console.log('[AreaMedico] Tab param found:', tabParam);
      setCurrentSection(tabParam);
      setActiveTab(tabParam);
      
      if (pacienteParam && tabParam === 'prontuarios') {
        const patientId = parseInt(pacienteParam);
        if (!isNaN(patientId)) {
          setSelectedPatientId(patientId);
          setShowProntuarioAba(true);
        }
      }
      if (tabParam === 'chat' && chatIdParam) {
        console.log('[AreaMedico] Deep link to chat ID:', chatIdParam);
      }
    }
  }, [location]);

  useEffect(() => {
    const storedType = localStorage.getItem('userType');
    setUserType(storedType);
    console.log('[AreaMedico] User type from localStorage:', storedType);
  }, []);

  useEffect(() => {
    const fetchUsuarioId = async () => {
      const email = localStorage.getItem("userEmail");
      console.log('[AreaMedico] Fetching user ID for email:', email);
      if (email) {
        const { data, error } = await supabase
          .from("usuarios")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        if (error) {
          console.error('[AreaMedico] Error fetching user ID from Supabase:', error);
        }
        if (data?.id) {
          setMedicoUsuarioId(data.id);
          console.log('[AreaMedico] Medico Usuario ID set from Supabase:', data.id);
        } else {
          console.warn('[AreaMedico] No user ID found in Supabase for email:', email);
        }
      } else {
        console.warn('[AreaMedico] No email found in localStorage to fetch user ID.');
      }
    };
    fetchUsuarioId();
  }, []);

  const handleTabChange = (value: string) => {
    console.log('[AreaMedico] handleTabChange called with value:', value);
    setActiveTab(value);
    setCurrentSection(value);
    setSelectedMedicoChat(null);
    setShowProntuarioAba(false);
    setSelectedPatientId(null);
    navigate(`/area-medico?tab=${value}`);
  };

  const handleOpenConsulta = (consultaId: number) => {
    setSelectedConsultaId(consultaId);
    setCurrentSection('consulta');
  };

  const handleOpenPatient = async (patientId: number) => {
    setSelectedPatientId(patientId);
    setShowProntuarioAba(true);
    setCurrentSection('prontuario');
    navigate(`/area-medico?tab=prontuarios&paciente=${patientId}`);
  };

  const handleBackFromProntuario = () => {
    setShowProntuarioAba(false);
    setCurrentSection('prontuarios');
    setSelectedPatientId(null);
    navigate('/area-medico?tab=prontuarios');
  };

  const handleBackToSection = (section: string) => {
    setCurrentSection(section);
    setSelectedConsultaId(null);
    setSelectedMedicoChat(null);
    setShowProntuarioAba(false);
    navigate(`/area-medico?tab=${section}`);
  };

  const handleSelectMedicoChat = (chatData: any) => {
    setSelectedMedicoChat(chatData);
  };

  const handleBackFromMedicoChat = () => {
    setSelectedMedicoChat(null);
  };

  const renderSection = () => {
    console.log('[AreaMedico] Rendering section:', currentSection, "Selected Medico Chat:", selectedMedicoChat, "Medico ID from hook:", medicoIdFromHook);
    if (showProntuarioAba && selectedPatientId) {
      return <ProntuarioAba onBack={handleBackFromProntuario} pacienteId={selectedPatientId} />;
    }
    switch (currentSection) {
      case 'dashboard':
        return <DashboardHome onOpenConsulta={handleOpenConsulta} />;
      case 'dashboard-clinica':
        return <ClinicaDashboard />;
      case 'agenda':
        console.log('[AreaMedico] Rendering AgendaMedica');
        return <AgendaMedica />;
      case 'prescricoes':
        return <Prescricoes />;
      case 'prontuarios':
        return <Prontuarios onSelectPatient={handleOpenPatient} />;
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
        ) : <p>Selecione uma consulta para visualizar.</p>;
      case 'chat':
        if (userInfoLoading) return <p>Carregando informações do usuário...</p>;
        if (!medicoIdFromHook) return <p>ID do médico não encontrado. Verifique seu perfil.</p>;
        
        if (selectedMedicoChat) {
          return (
            <ChatMedico
              medicoId={medicoIdFromHook}
              pacienteId={selectedMedicoChat.pacientes_app?.id || selectedMedicoChat.id_paciente}
              pacienteNome={selectedMedicoChat.pacientes_app?.nome || 'Paciente'}
              motivoConsulta={selectedMedicoChat.consultas?.motivo}
              dataConsulta={selectedMedicoChat.data_inicio}
              onBack={handleBackFromMedicoChat}
            />
          );
        }
        return (
          <ChatsList 
            medicoId={medicoIdFromHook} 
            onSelectChat={handleSelectMedicoChat} 
          />
        );
      default:
        return <DashboardHome onOpenConsulta={handleOpenConsulta} />;
    }
  };

  const navigateToSection = (section: string) => {
    console.log('[AreaMedico] navigateToSection called with section:', section);
    setCurrentSection(section);
    setSelectedMedicoChat(null);
    setShowProntuarioAba(false);
    setSelectedPatientId(null);
    setSelectedConsultaId(null);
    navigate(`/area-medico?tab=${section}`);
  };

  return (
    <DoctorScheduleProvider>
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
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
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
                    isActive={currentSection === 'prontuarios' && !showProntuarioAba}
                    className="text-white hover:bg-[#009E9B]"
                  >
                    <ClipboardList className="w-5 h-5 mr-2" /> Prontuários
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigateToSection('chat')}
                    isActive={currentSection === 'chat'}
                    className="text-white hover:bg-[#009E9B]"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" /> Chat com Pacientes
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
            <main className="w-full h-full p-6 md:p-8">
              {renderSection()}
              <EditProfileDialog 
                open={showProfileDialog}
                onOpenChange={setShowProfileDialog}
                userId={medicoUsuarioId || 0}
              />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </DoctorScheduleProvider>
  );
};

export default AreaMedico;
