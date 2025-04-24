import React from 'react';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import {
  Home,
  Users,
  FileText,
  Settings,
  Calendar,
  DollarSign,
  User,
  LogOut,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClinicaDashboard from '@/components/clinica-dashboard/ClinicaDashboard';
import { MedicosList } from '@/components/clinica-dashboard/MedicosList';
import { AgendamentosList } from '@/components/clinica-dashboard/AgendamentosList';
import { DocumentosList } from '@/components/clinica-dashboard/DocumentosList';
import EditProfileDialog from '@/components/medico/EditProfileDialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

const AreaClinica: React.FC = () => {
  const navigate = useNavigate();
  const [showProfileDialog, setShowProfileDialog] = React.useState(false);
  const { userData } = useAuth();
  const [currentSection, setCurrentSection] = React.useState('dashboard');
  const { toast } = useToast();
  
  const navigateToSection = (section: string) => {
    setCurrentSection(section);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userType');
      navigate('/login');
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar.",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="bg-[#00B3B0] text-white">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              <h2 className="text-xl font-bold">HopeCann</h2>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('dashboard')}
                  isActive={currentSection === 'dashboard'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <Home className="w-5 h-5 mr-2" /> Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('medicos')}
                  isActive={currentSection === 'medicos'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <Users className="w-5 h-5 mr-2" /> Médicos
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('agendamentos')}
                  isActive={currentSection === 'agendamentos'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <Calendar className="w-5 h-5 mr-2" /> Agendamentos
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('documentos')}
                  isActive={currentSection === 'documentos'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <FileText className="w-5 h-5 mr-2" /> Documentos
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigateToSection('financeiro')}
                  isActive={currentSection === 'financeiro'}
                  className="text-white hover:bg-[#009E9B]"
                >
                  <DollarSign className="w-5 h-5 mr-2" /> Financeiro
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-4 mt-auto space-y-2">
            <SidebarMenuButton 
              className="text-white hover:bg-[#009E9B] w-full" 
              onClick={() => setShowProfileDialog(true)}
            >
              <User className="w-5 h-5 mr-2" /> Perfil da Clínica
            </SidebarMenuButton>
            <SidebarMenuButton 
              className="text-white hover:bg-[#009E9B] w-full" 
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" /> Sair
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="bg-gray-50 flex-1">
          <header className="bg-white shadow-sm border-b">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {currentSection === 'dashboard' && 'Dashboard'}
                  {currentSection === 'medicos' && 'Médicos'}
                  {currentSection === 'agendamentos' && 'Agendamentos'}
                  {currentSection === 'documentos' && 'Documentos'}
                  {currentSection === 'financeiro' && 'Financeiro'}
                </h1>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Bem-vindo(a), {userData?.nome_clinica || 'Administrador'}
                  </span>
                </div>
              </div>
            </div>
          </header>
          <main className="w-full h-full p-8">
            {currentSection === 'dashboard' && <ClinicaDashboard />}
            {currentSection === 'medicos' && <MedicosList />}
            {currentSection === 'agendamentos' && <AgendamentosList />}
            {currentSection === 'documentos' && <DocumentosList />}
            <EditProfileDialog 
              open={showProfileDialog}
              onOpenChange={setShowProfileDialog}
              userId={userData?.id || 0}
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AreaClinica;
