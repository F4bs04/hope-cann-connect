
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

// Dashboard components
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

const AreaMedico: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentSection, setCurrentSection] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedConsultaId, setSelectedConsultaId] = useState<number | null>(null);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentSection(value);
  };

  const handleOpenConsulta = (consultaId: number) => {
    setSelectedConsultaId(consultaId);
    setCurrentSection('consulta');
  };

  const handleOpenPatient = (patientId: number) => {
    setSelectedPatientId(patientId);
    setCurrentSection('prontuario');
  };

  const handleBackToSection = (section: string) => {
    setCurrentSection(section);
    setSelectedConsultaId(null);
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <DashboardHome onOpenConsulta={handleOpenConsulta} />;
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex">
        <Sidebar className="bg-[#00B3B0] text-white">
          <SidebarHeader className="p-4">
            <h2 className="text-xl font-bold">HopeCann</h2>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setCurrentSection('dashboard')}
                  isActive={currentSection === 'dashboard'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <Home className="w-5 h-5 mr-2" /> Área Médica
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setCurrentSection('agenda')}
                  isActive={currentSection === 'agenda'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <Calendar className="w-5 h-5 mr-2" /> Agenda
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setCurrentSection('pacientes')}
                  isActive={currentSection === 'pacientes'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <Users className="w-5 h-5 mr-2" /> Pacientes
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setCurrentSection('prontuarios')}
                  isActive={currentSection === 'prontuarios'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <ClipboardList className="w-5 h-5 mr-2" /> Prontuários
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setCurrentSection('prescricoes')}
                  isActive={currentSection === 'prescricoes'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <FileText className="w-5 h-5 mr-2" /> Prescrições
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setCurrentSection('receitas')}
                  isActive={currentSection === 'receitas'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <FilePenLine className="w-5 h-5 mr-2" /> Receitas
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setCurrentSection('atestados')}
                  isActive={currentSection === 'atestados'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <FileCheck className="w-5 h-5 mr-2" /> Atestados
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setCurrentSection('laudos')}
                  isActive={currentSection === 'laudos'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <FileSignature className="w-5 h-5 mr-2" /> Laudos
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setCurrentSection('pedidos-exame')}
                  isActive={currentSection === 'pedidos-exame'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <Activity className="w-5 h-5 mr-2" /> Pedidos de Exame
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-4 mt-auto">
            <SidebarMenuButton className="text-white hover:bg-[#009E9B]">
              <User className="w-5 h-5 mr-2" /> Meu Perfil
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="bg-gray-50 flex-1">
          <Header />
          <main className="container mx-auto px-4 py-8">
            {renderSection()}
          </main>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AreaMedico;
