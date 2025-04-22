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

const DashboardPaciente = () => (
  <div>
    <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 mb-2">
      <PacienteProfileCard
        nome={perfilPaciente.nome}
        email={perfilPaciente.email}
        genero={perfilPaciente.genero}
        dataNascimento={perfilPaciente.dataNascimento}
        fotoUrl={perfilPaciente.fotoUrl}
      />
      <div className="sm:ml-6 sm:mb-3 mt-2 w-full sm:w-auto flex-shrink-0">
        <PacienteSaldoCard pacienteId={perfilPaciente.id} />
      </div>
    </div>
    <section className="mb-8">
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
    </section>
    <section>
      <div className="text-xl text-gray-800 font-semibold mb-2">Resumo</div>
      <ul className="grid gap-2">
        <li className="flex items-center gap-2 text-gray-700">
          <CalendarDays className="w-5 h-5 text-hopecann-teal" />
          Você tem uma consulta marcada para amanhã.
        </li>
        <li className="flex items-center gap-2 text-gray-700">
          <FileText className="w-5 h-5 text-blue-600" />
          Nova receita médica recebida do Dr. Ana Saúde.
        </li>
      </ul>
    </section>
  </div>
);

const ConsultasPaciente = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-hopecann-teal">Minhas Consultas</h2>
    <p>Suas consultas com médicos especialistas aparecerão aqui.</p>
    {/* Integrar consultas do Supabase aqui no futuro */}
  </div>
);

const PrescricoesPaciente = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-hopecann-teal">Prescrições</h2>
    <p>Suas prescrições médicas aparecem nesta área.</p>
    {/* Integrar prescrições do Supabase aqui */}
  </div>
);

const ReceitasPaciente = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-hopecann-teal">Receitas Médicas</h2>
    <p>Suas receitas de medicamentos aparecem aqui.</p>
    {/* Integrar receitas do Supabase aqui */}
  </div>
);

const AtestadosPaciente = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-hopecann-teal">Atestados</h2>
    <p>Seus atestados médicos enviados pelos profissionais estarão aqui.</p>
    {/* Integrar atestados do Supabase aqui */}
  </div>
);

const LaudosPaciente = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-hopecann-teal">Laudos</h2>
    <p>Todos os seus laudos médicos ficam salvos nesta área.</p>
    {/* Integrar laudos do Supabase aqui */}
  </div>
);

const PedidosExamePaciente = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-hopecann-teal">Pedidos de Exame</h2>
    <p>Pedidos de exames feitos pelo médico aparecem aqui para você baixar ou apresentar.</p>
    {/* Integrar pedidos de exame do Supabase aqui */}
  </div>
);

const MedicosPaciente = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-hopecann-teal">Médicos</h2>
    <p>Visualize todos os profissionais que já consultaram você ou disponíveis na plataforma.</p>
    {/* Integração com a lista de médicos no futuro */}
  </div>
);

const MENU_ITEMS = [
  { key: 'dashboard', label: 'Início', icon: CalendarDays },
  { key: 'consultas', label: 'Consultas', icon: CalendarDays },
  { key: 'prescricoes', label: 'Prescrições', icon: HeartPulse },
  { key: 'receitas', label: 'Receitas', icon: FileText },
  { key: 'atestados', label: 'Atestados', icon: File },
  { key: 'laudos', label: 'Laudos', icon: File },
  { key: 'pedidos-exame', label: 'Pedidos de Exame', icon: File },
  { key: 'medicos', label: 'Médicos', icon: Users },
];

const AreaPacienteV2: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const navigate = useNavigate();

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <DashboardPaciente />;
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
        return <DashboardPaciente />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
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
          <main className="w-full h-full p-6 md:p-8 animate-fade-in">{renderSection()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AreaPacienteV2;
