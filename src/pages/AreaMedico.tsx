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
  User
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const [medicoUserId, setMedicoUserId] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const pacienteParam = params.get('paciente');
    
    if (tabParam) {
      setCurrentSection(tabParam);
      setActiveTab(tabParam);
      
      if (pacienteParam && tabParam === 'prontuarios') {
        const patientId = parseInt(pacienteParam);
        if (!isNaN(patientId)) {
          setSelectedPatientId(patientId);
          setShowProntuarioAba(true);
        }
      }
    }
  }, [location]);

  useEffect(() => {
    const storedType = localStorage.getItem('userType');
    setUserType(storedType);
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      const email = localStorage.getItem("userEmail");
      if (email) {
        const { data, error } = await import("@/integrations/supabase/client").then(m => m.supabase)
          .from("usuarios")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        if (data?.id) setMedicoUserId(data.id);
      }
    };
    fetchUserId();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentSection(value);
    navigate(`/area-medico?tab=${value}`);
  };

  const handleOpenConsulta = (consultaId: number) => {
    setSelectedConsultaId(consultaId);
    setCurrentSection('consulta');
  };

  const handleOpenPatient = (patientId: number) => {
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
    navigate(`/area-medico?tab=${section}`);
  };

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
        ) : null;
      default:
        return <DashboardHome onOpenConsulta={handleOpenConsulta} />;
    }
  };

  const navigateToSection = (section: string) => {
    setCurrentSection(section);
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
              </SidebarMenu>
            </SidebarContent>
            
            <SidebarFooter className="p-4 mt-auto">
              <SidebarMenuButton className="text-white hover:bg-[#009E9B]" onClick={() => setShowProfileDialog(true)}>
                <User className="w-5 h-5 mr-2" /> Meu Perfil
              </SidebarMenuButton>
            </SidebarFooter>
          </Sidebar>
          
          <SidebarInset className="bg-gray-50 flex-1">
            <main className="w-full h-full p-8">
              {renderSection()}
              <EditProfileDialog 
                open={showProfileDialog}
                onOpenChange={setShowProfileDialog}
                userId={medicoUserId || 0}
              />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </DoctorScheduleProvider>
  );
};

export default AreaMedico;
