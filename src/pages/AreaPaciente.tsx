import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import PacienteHeader from "@/components/paciente/PacienteHeader";
import { PacienteSidebar } from '@/components/area-paciente/PacienteSidebar';
import PacienteDashboard from '@/components/area-paciente/PacienteDashboard';
import ConsultasPaciente from '@/components/paciente/ConsultasPaciente';
import ReceitasPaciente from '@/components/paciente/ReceitasPaciente';
import AtestadosPaciente from '@/components/paciente/AtestadosPaciente';
import LaudosPaciente from '@/components/paciente/LaudosPaciente';
import PedidosExamePaciente from '@/components/paciente/PedidosExamePaciente';
import MedicosPaciente from '@/components/paciente/MedicosPaciente';
import PacientePerfilDetalhes from '@/components/area-paciente/PacientePerfilDetalhes';
import SmartScheduling from '@/components/scheduling/SmartScheduling';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from "@/integrations/supabase/client";

// Importando interface do arquivo centralizado
import { Paciente } from '@/components/area-paciente/perfil/Paciente.types';

interface AreaPacienteProps {
  initialSection?: string;
}

const AreaPaciente: React.FC<AreaPacienteProps> = ({ initialSection = 'dashboard' }) => {
  const [currentSection, setCurrentSection] = useState(initialSection);
  const { userProfile: initialPaciente, isLoading: loading } = useUnifiedAuth();
  const [pacienteData, setPacienteData] = useState<Paciente | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Verificação inicial de autenticação
  useEffect(() => {
    const checkAuthentication = async () => {
      // Verifica sessão do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      // Verifica localStorage
      const isLocalAuth = localStorage.getItem('isAuthenticated') === 'true';
      const userEmail = localStorage.getItem('userEmail');
      
      const isAuthenticated = !!session || (isLocalAuth && userEmail);
      setAuthChecked(true);
      
      // Se não estiver autenticado e a página já carregou completamente,
      // não é necessário redirecionar aqui pois o hook usePacienteAuth já fará isso
    };
    
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (initialPaciente && initialPaciente.id) {
      // O initialPaciente vem da tabela profiles, precisamos buscar os dados do patient
      const fetchPatientData = async () => {
        try {
          const { data: patientData, error } = await supabase
            .from('patients')
            .select('*')
            .eq('user_id', initialPaciente.id)
            .single();

          if (error) {
            console.error("Erro ao buscar dados do paciente:", error);
            return;
          }

          if (patientData) {
            // Converter os dados para o formato esperado
            const pacienteFormatted: Paciente = {
              id: parseInt(patientData.id) || 0,
              id_usuario: initialPaciente.id,
              nome: initialPaciente.nome,
              email: initialPaciente.email,
              cpf: patientData.cpf,
              data_nascimento: patientData.birth_date,
              endereco: patientData.address,
              telefone: initialPaciente.telefone,
              genero: patientData.gender
            };
            
            setPacienteData(pacienteFormatted);
          }
        } catch (error) {
          console.error("Erro ao processar dados do paciente:", error);
        }
      };

      fetchPatientData();
    }
  }, [initialPaciente]);
  
  useEffect(() => {
    if (initialSection) {
      setCurrentSection(initialSection);
    }
  }, [initialSection]);

  const handleUpdatePaciente = (updatedPaciente: Paciente) => {
    setPacienteData(updatedPaciente);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // Se a autenticação foi verificada e não temos dados do paciente, mostra uma mensagem melhor
  if (authChecked && !pacienteData && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-4xl mb-4">Acesso não autorizado</div>
        <p className="text-lg text-center mb-6">
          Não foi possível verificar suas credenciais. Por favor, faça login novamente.
        </p>
        <a 
          href="/login" 
          className="bg-hopecann-teal hover:bg-hopecann-teal/90 text-white px-6 py-3 rounded-lg font-medium"
        >
          Ir para o Login
        </a>
      </div>
    );
  }

  const pacienteId = pacienteData?.id || 0;

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <PacienteDashboard />;
      case 'agendar':
        return <SmartScheduling />;
      case 'consultas':
        return <ConsultasPaciente />;
      case 'receitas':
        return <ReceitasPaciente />;
      case 'atestados':
        return <AtestadosPaciente />;
      case 'laudos':
        return <LaudosPaciente />;
      case 'pedidos-exame':
        return <PedidosExamePaciente />;
      case 'medicos':
        return <MedicosPaciente pacienteId={pacienteId} />;
      case 'perfil':
        // Passando o pacienteData que já inclui id e id_usuario corretamente formatados
        return <PacientePerfilDetalhes paciente={pacienteData} onUpdatePaciente={handleUpdatePaciente} />;
      default:
        return <PacienteDashboard />;
    }
  };

  return (
    <div className="min-h-screen w-full">
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <PacienteSidebar
            currentSection={currentSection}
            onSectionChange={setCurrentSection}
          />
          <SidebarInset className="bg-gray-50 flex-1">
            <PacienteHeader pacienteNome={pacienteData?.nome} />
            <main className="w-full h-full p-4 md:p-6 lg:p-8 animate-fade-in">
              {renderSection()}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AreaPaciente;
