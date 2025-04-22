
import React, { useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  User,
  Users,
  Calendar,
  FileText,
  File,
  Notes,
  Prescription,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ConsultasPaciente = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Consultas</h2>
    <p>Suas consultas com médicos aparecerão aqui.</p>
    {/* Integrar consultas do Supabase aqui */}
  </div>
);

const PrescricoesPaciente = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Prescrições</h2>
    <p>Suas prescrições aparecerão aqui.</p>
    {/* Integrar prescrições do Supabase aqui */}
  </div>
);

const ReceitasPaciente = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Receitas</h2>
    <p>Suas receitas de medicamentos aparecerão aqui.</p>
    {/* Integrar receitas do Supabase aqui */}
  </div>
);

const AtestadosPaciente = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Atestados</h2>
    <p>Seus atestados médicos aparecerão aqui.</p>
    {/* Integrar atestados do Supabase aqui */}
  </div>
);

const LaudosPaciente = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Laudos</h2>
    <p>Seus laudos médicos aparecerão aqui.</p>
    {/* Integrar laudos do Supabase aqui */}
  </div>
);

const PedidosExamePaciente = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Pedidos de Exame</h2>
    <p>Seus pedidos de exames aparecerão aqui.</p>
    {/* Integrar pedidos de exame do Supabase aqui */}
  </div>
);

const MedicosPaciente = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Médicos</h2>
    <p>Aqui você pode visualizar os médicos com quem já consultou ou que estão disponíveis na plataforma.</p>
    {/* Integrar lista de médicos do Supabase aqui */}
  </div>
);

const MENU_ITEMS = [
  { key: 'consultas', label: 'Consultas', icon: Calendar },
  { key: 'prescricoes', label: 'Prescrições', icon: Prescription },
  { key: 'receitas', label: 'Receitas', icon: FileText },
  { key: 'atestados', label: 'Atestados', icon: File },
  { key: 'laudos', label: 'Laudos', icon: Notes },
  { key: 'pedidos-exame', label: 'Pedidos de Exame', icon: File },
  { key: 'medicos', label: 'Médicos', icon: Users },
];

const AreaPacienteV2: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('consultas');
  const navigate = useNavigate();

  const renderSection = () => {
    switch (currentSection) {
      case 'consultas':
        return <ConsultasPaciente />;
      case 'prescricoes':
        return <PrescricoesPaciente />;
      case 'receitas':
        return <ReceitasPaciente />;
      case 'atestados':
        return <AtestadosPaciente />;
      case 'laudos':
        return <LaudosPaciente />;
      case 'pedidos-exame':
        return <PedidosExamePaciente />;
      case 'medicos':
        return <MedicosPaciente />;
      default:
        return <ConsultasPaciente />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="bg-[#F2F7FA] text-gray-800">
          <SidebarHeader className="p-4">
            <h2 className="text-xl font-bold text-hopecann-teal">HopeCann</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {MENU_ITEMS.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    onClick={() => setCurrentSection(item.key)}
                    isActive={currentSection === item.key}
                    className="hover:bg-hopecann-teal/10 text-gray-800"
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 mt-auto">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('userEmail');
                navigate('/login');
              }}
            >
              Sair
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="bg-gray-50 flex-1">
          <main className="w-full h-full p-8">{renderSection()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AreaPacienteV2;
