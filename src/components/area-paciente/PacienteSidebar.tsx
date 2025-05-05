
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { usePacienteMenuItems } from '@/hooks/usePacienteMenuItems';

interface PacienteSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export const PacienteSidebar: React.FC<PacienteSidebarProps> = ({
  currentSection,
  onSectionChange,
}) => {
  const navigate = useNavigate();
  const menuItems = usePacienteMenuItems();
  const userEmail = localStorage.getItem('userEmail') || 'Usuário';

  const handleProfileClick = () => {
    navigate('/area-paciente/perfil');
  };

  return (
    <Sidebar className="bg-[#F2F7FA] text-gray-800 min-w-[240px]">
      <SidebarHeader className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <User className="w-7 h-7 text-hopecann-teal" />
          <h2 className="text-xl font-bold text-hopecann-teal">HopeCann Saúde</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.key}>
              <SidebarMenuButton
                onClick={() => onSectionChange(item.key)}
                isActive={currentSection === item.key}
                className="hover:bg-hopecann-teal/10 text-gray-800 data-[active=true]:bg-hopecann-teal/20"
              >
                <item.icon className="w-5 h-5 min-w-5 mr-2" />
                <span className="truncate">{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto border-t border-gray-100">
        <button 
          onClick={handleProfileClick}
          className="flex items-center gap-3 w-full hover:bg-hopecann-teal/5 p-2 rounded-lg transition-colors"
        >
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>
              <User className="h-5 w-5 text-hopecann-teal" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600 truncate">{userEmail}</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};
