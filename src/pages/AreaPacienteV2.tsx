
import React, { useState, useEffect } from 'react';
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
  CalendarDays,
  FileText,
  File,
  User,
  Users,
  MessageSquare,
  HeartPulse,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PacienteProfileCard from "@/components/paciente/PacienteProfileCard";
import PacienteSaldoCard from "@/components/paciente/PacienteSaldoCard";
import PacienteHeader from "@/components/paciente/PacienteHeader";
import ReceitasRecentes from "@/components/paciente/ReceitasRecentes";
import ReceitasPaciente from "@/components/paciente/ReceitasPaciente";
import { supabase } from '@/integrations/supabase/client';

// Define menu items for the sidebar
const MENU_ITEMS = [
  {
    key: 'dashboard',
    icon: CalendarDays,
    label: 'Início'
  },
  {
    key: 'consultas',
    icon: HeartPulse,
    label: 'Consultas'
  },
  {
    key: 'receitas',
    icon: FileText,
    label: 'Receitas'
  },
  {
    key: 'laudos',
    icon: File,
    label: 'Laudos'
  },
  {
    key: 'atestados',
    icon: File,
    label: 'Atestados'
  },
  {
    key: 'pedidos-exame',
    icon: File,
    label: 'Pedidos de Exame'
  },
  {
    key: 'medicos',
    icon: Users,
    label: 'Meus Médicos'
  },
];

const CARD_DATA = [
  {
    label: "Próxima Consulta",
    value: "25/04 às 14:00",
    icon: <CalendarDays className="w-6 h-6 text-hopecann-teal" />,
    colorClass: "bg-hopecann-teal/10",
  },
  {
    label: "Consultas Pendentes",
    value: "2",
    icon: <HeartPulse className="w-6 h-6 text-hopecann-green" />,
    colorClass: "bg-hopecann-green/10",
  },
  {
    label: "Novos Documentos",
    value: "1 receita",
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    colorClass: "bg-blue-100",
  },
];

const perfilPaciente = {
  id: 1, // ID de exemplo, ajuste conforme necessário para dados reais
  nome: "Gabriel Almeida",
  email: "gabriel@email.com",
  genero: "Masculino",
  dataNascimento: "1992-05-20",
  fotoUrl: "",
};

const DashboardPaciente = () => {
  const [receitas, setReceitas] = useState<any[]>([]);

  useEffect(() => {
    // Fetch recent prescriptions
    const fetchReceitas = async () => {
      const { data, error } = await supabase
        .from('receitas_app')
        .select('*')
        .order('data', { ascending: false })
        .limit(3);
      
      if (data) {
        setReceitas(data);
      }
    };

    fetchReceitas();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 mb-2">
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-4">Resumo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CARD_DATA.map((card) => (
              <div
                key={card.label}
                className={`rounded-xl p-5 flex items-center gap-3 shadow-sm ${card.colorClass}`}
              >
                <span>{card.icon}</span>
                <div>
                  <div className="font-semibold text-lg text-gray-800">
                    {card.value}
                  </div>
                  <div className="text-gray-500 text-sm">{card.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <ReceitasRecentes receitas={receitas} />
      </div>
    </div>
  );
};

// Placeholder components for other sections
// These would be properly implemented in separate files in a production app
const ConsultasPaciente = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Consultas</h2>
      <p>Esta seção exibirá suas consultas agendadas e históricas.</p>
    </div>
  );
};

const PrescricoesPaciente = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Prescrições</h2>
      <p>Esta seção exibirá suas prescrições médicas.</p>
    </div>
  );
};

const AtestadosPaciente = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Atestados</h2>
      <p>Esta seção exibirá seus atestados médicos.</p>
    </div>
  );
};

const LaudosPaciente = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Laudos</h2>
      <p>Esta seção exibirá seus laudos médicos.</p>
    </div>
  );
};

const PedidosExamePaciente = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pedidos de Exame</h2>
      <p>Esta seção exibirá seus pedidos de exames.</p>
    </div>
  );
};

const MedicosPaciente = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Meus Médicos</h2>
      <p>Esta seção exibirá a lista de médicos que você já consultou.</p>
    </div>
  );
};

const AreaPacienteV2: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [paciente, setPaciente] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        navigate('/login');
        return;
      }
      
      const { data: pacienteData } = await supabase
        .from('pacientes_app')
        .select('*')
        .eq('email', userEmail)
        .single();
      
      if (pacienteData) {
        setPaciente(pacienteData);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <DashboardPaciente />;
      case 'consultas':
        return <ConsultasPaciente />;
      case 'prescricoes':
        return <PrescricoesPaciente />;
      case 'receitas':
        return <ReceitasPaciente pacienteId={paciente?.id || 0} />;
      case 'atestados':
        return <AtestadosPaciente />;
      case 'laudos':
        return <LaudosPaciente />;
      case 'pedidos-exame':
        return <PedidosExamePaciente />;
      case 'medicos':
        return <MedicosPaciente />;
      default:
        return <DashboardPaciente />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PacienteHeader pacienteNome={paciente?.nome} />
      <div className="flex flex-1">
        <SidebarProvider>
          <Sidebar className="bg-[#F2F7FA] text-gray-800 min-w-[240px]">
            <SidebarHeader className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <User className="w-7 h-7 text-hopecann-teal" />
                <h2 className="text-xl font-bold text-hopecann-teal">HopeCann Saúde</h2>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {MENU_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      onClick={() => setCurrentSection(item.key)}
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
            <main className="w-full h-full p-6 md:p-8 animate-fade-in">
              {renderSection()}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default AreaPacienteV2;
