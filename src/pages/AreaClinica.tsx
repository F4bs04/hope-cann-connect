
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
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClinicaDashboard from '@/components/clinica-dashboard/ClinicaDashboard';
import EditProfileDialog from '@/components/medico/EditProfileDialog';
import { useAuth } from '@/hooks/useAuth';

const AreaClinica: React.FC = () => {
  const navigate = useNavigate();
  const [showProfileDialog, setShowProfileDialog] = React.useState(false);
  const { userData } = useAuth();
  const [currentSection, setCurrentSection] = React.useState('dashboard');
  
  const navigateToSection = (section: string) => {
    setCurrentSection(section);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="bg-[#00B3B0] text-white">
          <SidebarHeader className="p-4">
            <h2 className="text-xl font-bold">HopeCann - Área da Clínica</h2>
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
          
          <SidebarFooter className="p-4 mt-auto">
            <SidebarMenuButton 
              className="text-white hover:bg-[#009E9B]" 
              onClick={() => setShowProfileDialog(true)}
            >
              <User className="w-5 h-5 mr-2" /> Perfil da Clínica
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="bg-gray-50 flex-1">
          <main className="w-full h-full p-8">
            {currentSection === 'dashboard' && <ClinicaDashboard />}
            {/* Outros componentes serão adicionados aqui conforme necessário */}
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
