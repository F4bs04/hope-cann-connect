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
  MessageSquare, // Importar ícone para o chat
  User
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
import ChatsList from '@/components/medico/ChatsList'; // Importar ChatsList
import ChatMedico from '@/components/medico/ChatMedico'; // Importar ChatMedico

const AreaMedico: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  // activeTab state might be removable if DoctorTabs is not used for main navigation anymore
  // const [activeTab, setActiveTab] = useState('dashboard'); 
  const [currentSection, setCurrentSection] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedConsultaId, setSelectedConsultaId] = useState<number | null>(null);
  const [showProntuarioAba, setShowProntuarioAba] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [medicoUserId, setMedicoUserId] = useState<number | null>(null); // Este é usuarios.id
  const [actualMedicoId, setActualMedicoId] = useState<number | null>(null); // Este será medicos.id
  const [selectedMedicoChat, setSelectedMedicoChat] = useState<any>(null); // Para a página de chat

  useEffect(() => {
    console.log('[AreaMedico] Location or search params changed:', location.search);
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab'); // 'tab' is used as 'section' here
    const pacienteParam = params.get('paciente');
    
    if (tabParam) {
      console.log('[AreaMedico] Section param found:', tabParam);
      setCurrentSection(tabParam);
      // setActiveTab(tabParam); // Potentially remove if tabs are not primary nav for these sections
      
      if (pacienteParam && tabParam === 'prontuarios') {
        const patientId = parseInt(pacienteParam);
        if (!isNaN(patientId)) {
          setSelectedPatientId(patientId);
          setShowProntuarioAba(true);
        }
      }
    } else {
      // If no tab/section in URL, default to dashboard
      // navigate('/area-medico?tab=dashboard', { replace: true }); // Avoid infinite loop if already on /area-medico
      setCurrentSection('dashboard');
    }
  }, [location, navigate]);

  useEffect(() => {
    const storedType = localStorage.getItem('userType');
    setUserType(storedType);
    console.log('[AreaMedico] User type from localStorage:', storedType);
  }, []);

  useEffect(() => {
    const fetchUserIdAndMedicoId = async () => {
      const email = localStorage.getItem("userEmail");
      console.log('[AreaMedico] Fetching user ID for email:', email);
      if (email) {
        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (userError) {
          console.error('[AreaMedico] Error fetching user ID from Supabase:', userError);
          toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar dados do usuário." });
          return;
        }
        if (userData?.id) {
          setMedicoUserId(userData.id);
          console.log('[AreaMedico] Medico User ID (usuarios.id) set from Supabase:', userData.id);

          // Agora buscar medicos.id usando usuarios.id
          const { data: medicoData, error: medicoError } = await supabase
            .from('medicos')
            .select('id')
            .eq('id_usuario', userData.id)
            .single(); // Assume que id_usuario é único em medicos ou que queremos o primeiro

          if (medicoError) {
            console.error('[AreaMedico] Error fetching medicos.id:', medicoError);
            if (medicoError.code === 'PGRST116') { // "The result contains 0 rows"
              toast({ variant: "destructive", title: "Perfil Incompleto", description: "Dados do perfil médico não encontrados. Complete seu cadastro." });
            } else {
              toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar dados do perfil médico." });
            }
            return;
          }
          if (medicoData?.id) {
            setActualMedicoId(medicoData.id);
            console.log('[AreaMedico] Actual Medico ID (medicos.id) set:', medicoData.id);
          } else {
            console.warn('[AreaMedico] No medicos.id found for usuarios.id:', userData.id);
            toast({ variant: "warning", title: "Atenção", description: "Perfil médico não vinculado corretamente." });
          }

        } else {
          console.warn('[AreaMedico] No user ID found in Supabase for email:', email);
          toast({ variant: "destructive", title: "Erro de Autenticação", description: "Usuário não identificado." });
        }
      } else {
        console.warn('[AreaMedico] No email found in localStorage to fetch user ID.');
        toast({ variant: "destructive", title: "Sessão Expirada", description: "Faça login novamente." });
        // navigate('/login'); // Consider redirecting to login
      }
    };
    fetchUserIdAndMedicoId();
  }, [toast]);

  const handleTabChange = (value: string) => {
    console.log('[AreaMedico] handleTabChange called with value:', value);
    // setActiveTab(value); // This might be part of DoctorTabs logic, not top-level section logic
    setCurrentSection(value);
    setSelectedMedicoChat(null); // Reset chat selection when changing main sections
    navigate(`/area-medico?tab=${value}`);
  };

  const handleOpenConsulta = (consultaId: number) => {
    setSelectedConsultaId(consultaId);
    setCurrentSection('consulta');
    navigate(`/area-medico?tab=consulta&id=${consultaId}`);
  };

  const handleOpenPatient = (patientId: number) => {
    setSelectedPatientId(patientId);
    setShowProntuarioAba(true);
    setCurrentSection('prontuario'); // Keep section as prontuario, but showProntuarioAba controls content
    navigate(`/area-medico?tab=prontuarios&paciente=${patientId}`);
  };

  const handleBackFromProntuario = () => {
    setShowProntuarioAba(false);
    setCurrentSection('prontuarios'); // Or whatever the previous section was, typically 'prontuarios'
    setSelectedPatientId(null);
    navigate('/area-medico?tab=prontuarios');
  };

  const handleBackToSection = (section: string) => {
    setCurrentSection(section);
    setSelectedConsultaId(null);
    setSelectedMedicoChat(null); // Reset chat if going back to a list view
    navigate(`/area-medico?tab=${section}`);
  };

  const renderSection = () => {
    console.log('[AreaMedico] Rendering section:', currentSection, "actualMedicoId:", actualMedicoId);
    if (showProntuarioAba && selectedPatientId) { // Ensure selectedPatientId is also checked
      console.log('[AreaMedico] Rendering ProntuarioAba for patient ID:', selectedPatientId);
      return <ProntuarioAba onBack={handleBackFromProntuario} />;
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
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-600">Nenhuma consulta selecionada.</p>
            <Button onClick={() => handleBackToSection('dashboard')}>Voltar ao Dashboard</Button>
          </div>
        );
      case 'chat': // Nova seção para chat
        if (!actualMedicoId) {
          return (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full" />
              <p className="ml-4 text-gray-600">Carregando dados do médico...</p>
            </div>
          );
        }
        return selectedMedicoChat ? (
          <ChatMedico
            medicoId={actualMedicoId}
            pacienteId={selectedMedicoChat.pacientes_app.id}
            pacienteNome={selectedMedicoChat.pacientes_app.nome}
            motivoConsulta={selectedMedicoChat.consultas?.motivo || selectedMedicoChat.motivo_consulta || "Chat Geral"}
            dataConsulta={selectedMedicoChat.data_inicio || selectedMedicoChat.data_consulta}
            onBack={() => setSelectedMedicoChat(null)}
          />
        ) : (
          <ChatsList
            medicoId={actualMedicoId}
            onSelectChat={setSelectedMedicoChat}
          />
        );
      default:
        // Fallback to dashboard if currentSection is unrecognized
        if (location.pathname === '/area-medico' && !location.search.includes('tab=')) {
           // Temporarily navigate to dashboard if no tab on initial load. Consider better default logic.
           // This might cause issues if not handled carefully.
           // navigate('/area-medico?tab=dashboard', { replace: true });
        }
        return <DashboardHome onOpenConsulta={handleOpenConsulta} />;
    }
  };

  const navigateToSection = (section: string) => {
    console.log('[AreaMedico] navigateToSection called with section:', section);
    setCurrentSection(section);
    setShowProntuarioAba(false); 
    setSelectedPatientId(null);
    setSelectedConsultaId(null);
    setSelectedMedicoChat(null); // Reset chat selection
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

                {/* ... keep existing code (dashboard-clinica menu item) */}
                {userType === 'clinica' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => navigateToSection('dashboard-clinica')}
                      isActive={currentSection === 'dashboard-clinica'}
                      className="text-white hover:bg-[#009E9B]"
                    >
                      <span className="mr-2 inline-flex items-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15v4a2 2 0 002 2h14a2 2 0 002-2v-4m-7-7l-4 4m0 0l4 4m-4-4h14M3 9V5a2 2 0 012-2h14a2 2 0 012 2v4"></path></svg>
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

                <SidebarMenuItem> {/* Novo item de menu para Chat */}
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
                    onClick={() => navigateToSection('receitas')}
                    isActive={currentSection === 'receitas'}
                    className="text-white hover:bg-[#009E9B]"
                  >
                    <FilePenLine className="w-5 h-5 mr-2" /> Receitas
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {/* ... keep existing code (Atestados, Laudos, Pedidos de Exame menu items) */}
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
          
          <SidebarInset className="bg-gray-50 flex-1 overflow-y-auto"> {/* Adicionado overflow-y-auto */}
            <MedicoHeader />
            <main className="w-full h-full p-6 md:p-8"> {/* Ajustado padding se necessário */}
              {renderSection()}
              <EditProfileDialog 
                open={showProfileDialog}
                onOpenChange={setShowProfileDialog}
                userId={medicoUserId || 0} // Passa usuarios.id
              />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </DoctorScheduleProvider>
  );
};

export default AreaMedico;
