
import React, { useState, useEffect } from 'react';
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
import { usePacienteAuth } from '@/hooks/usePacienteAuth';
import { supabase } from "@/integrations/supabase/client";

interface Paciente {
  id: number;
  nome?: string;
  email?: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: string;
  telefone?: string;
  genero?: string;
}

interface AreaPacienteProps {
  initialSection?: string;
}

const AreaPaciente: React.FC<AreaPacienteProps> = ({ initialSection = 'dashboard' }) => {
  const [currentSection, setCurrentSection] = useState(initialSection);
  const { paciente: initialPaciente, loading } = usePacienteAuth();
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
    if (initialPaciente) {
      // Certifique-se de que o ID está presente e é um número
      const idAsNumber = typeof initialPaciente.id === 'string' ? parseInt(initialPaciente.id, 10) : initialPaciente.id;
      if (isNaN(idAsNumber)) {
        console.error("ID do paciente inválido:", initialPaciente.id);
        // Tratar o caso de ID inválido, talvez redirecionar ou mostrar erro
        setPacienteData(null); // ou alguma forma de estado de erro
        return;
      }
      setPacienteData({ ...initialPaciente, id: idAsNumber });
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
      case 'consultas':
        return <ConsultasPaciente pacienteId={pacienteId} />;
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
      case 'perfil':
        return <PacientePerfilDetalhes paciente={pacienteData} onUpdatePaciente={handleUpdatePaciente} />;
      default:
        return <PacienteDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PacienteHeader pacienteNome={pacienteData?.nome} />
      <div className="flex flex-1">
        <SidebarProvider>
          <PacienteSidebar
            currentSection={currentSection}
            onSectionChange={setCurrentSection}
          />
          <SidebarInset className="bg-gray-50 flex-1">
            <main className="w-full h-full p-4 md:p-6 lg:p-8 animate-fade-in">
              {renderSection()}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default AreaPaciente;
