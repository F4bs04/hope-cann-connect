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
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PacienteProfileCard from "@/components/paciente/PacienteProfileCard";
import PacienteSaldoCard from "@/components/paciente/PacienteSaldoCard";
import PacienteHeader from "@/components/paciente/PacienteHeader";
import ReceitasRecentes from "@/components/paciente/ReceitasRecentes";
import ReceitasPaciente from "@/components/paciente/ReceitasPaciente";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  id: 1,
  nome: "Gabriel Almeida",
  email: "gabriel@email.com",
  genero: "Masculino",
  dataNascimento: "1992-05-20",
  fotoUrl: "",
};

const DashboardPaciente = ({ pacienteId }: { pacienteId: number }) => {
  const [receitas, setReceitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (pacienteId <= 0) {
      setLoading(false);
      return;
    }
    
    const fetchReceitas = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('receitas_app')
          .select('*')
          .eq('id_paciente', pacienteId)
          .order('data', { ascending: false })
          .limit(3);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setReceitas(data);
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        toast({
          title: "Erro ao carregar receitas",
          description: "Não foi possível carregar suas receitas. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReceitas();
  }, [pacienteId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-hopecann-teal" />
      </div>
    );
  }

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

const ConsultasPaciente = ({ pacienteId }: { pacienteId: number }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Consultas</h2>
      <p>Esta seção exibirá suas consultas agendadas e históricas.</p>
    </div>
  );
};

const PrescricoesPaciente = ({ pacienteId }: { pacienteId: number }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Prescrições</h2>
      <p>Esta seção exibirá suas prescrições médicas.</p>
    </div>
  );
};

const AtestadosPaciente = ({ pacienteId }: { pacienteId: number }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Atestados</h2>
      <p>Esta seção exibirá seus atestados médicos.</p>
    </div>
  );
};

const LaudosPaciente = ({ pacienteId }: { pacienteId: number }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Laudos</h2>
      <p>Esta seção exibirá seus laudos médicos.</p>
    </div>
  );
};

const PedidosExamePaciente = ({ pacienteId }: { pacienteId: number }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pedidos de Exame</h2>
      <p>Esta seção exibirá seus pedidos de exames.</p>
    </div>
  );
};

const MedicosPaciente = ({ pacienteId }: { pacienteId: number }) => {
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
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const userEmail = localStorage.getItem('userEmail');
        
        if (!userEmail) {
          toast({
            title: "Acesso não autorizado",
            description: "Faça login para acessar a área do paciente.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }
        
        const { data: pacienteData, error } = await supabase
          .from('pacientes_app')
          .select('*')
          .eq('email', userEmail)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (pacienteData) {
          setPaciente(pacienteData);
        } else {
          toast({
            title: "Perfil não encontrado",
            description: "Não encontramos um perfil de paciente associado ao seu login.",
            variant: "destructive"
          });
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userEmail');
          navigate('/login');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        toast({
          title: "Erro de autenticação",
          description: "Ocorreu um erro ao verificar suas credenciais. Por favor, faça login novamente.",
          variant: "destructive"
        });
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        navigate('/login');
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const renderSection = () => {
    const pacienteId = paciente?.id || 0;
    
    switch (currentSection) {
      case 'dashboard':
        return <DashboardPaciente pacienteId={pacienteId} />;
      case 'consultas':
        return <ConsultasPaciente pacienteId={pacienteId} />;
      case 'prescricoes':
        return <PrescricoesPaciente pacienteId={pacienteId} />;
      case 'receitas':
        return <ReceitasPaciente pacienteId={pacienteId} />;
      case 'atestados':
        return <AtestadosPaciente pacienteId={pacienteId} />;
      case 'laudos':
        return <LaudosPaciente pacienteId={pacienteId} />;
      case 'pedidos-exame':
        return <PedidosExamePaciente pacienteId={pacienteId} />;
      case 'medicos':
        return <MedicosPaciente pacienteId={pacienteId} />;
      default:
        return <DashboardPaciente pacienteId={pacienteId} />;
    }
  };

  if (loading && !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-hopecann-teal mx-auto mb-4" />
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!authChecked) return null;

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
