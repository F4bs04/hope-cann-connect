
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
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

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    navigate('/login');
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
                <item.icon className="w-5 h-5 mr-2" />
                {item.label}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto border-t border-gray-100">
        <Button
          className="w-full"
          variant="outline"
          onClick={handleLogout}
        >
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
