
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

interface Paciente { // Definindo a interface Paciente aqui também para consistência
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

  if (loading && !pacienteData) { // Ajustado para considerar pacienteData
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full" />
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
