
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Paciente, 
  Consulta, 
  Receita, 
  Mensagem, 
  HistoricoPaciente, 
  AcompanhamentoPaciente 
} from '@/types/doctorScheduleTypes';
import { 
  pacientesMock, 
  consultasMock, 
  receitasMock, 
  mensagensMock,
  historicosPacientesMock,
  acompanhamentosPacientesMock
} from '@/mocks/doctorScheduleMockData';

export function usePacientesData() {
  const { toast } = useToast();
  const [consultas, setConsultas] = useState<Consulta[]>(consultasMock);
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensMock);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [selectedMensagem, setSelectedMensagem] = useState<Mensagem | null>(null);
  const [historicos, setHistoricos] = useState<HistoricoPaciente[]>(historicosPacientesMock);
  const [acompanhamentos, setAcompanhamentos] = useState<AcompanhamentoPaciente[]>(acompanhamentosPacientesMock);
  
  // Derived states
  const historicoPaciente = selectedPaciente 
    ? historicos.find(h => h.id_paciente === selectedPaciente.id) || null
    : null;

  const acompanhamentosPaciente = selectedPaciente
    ? acompanhamentos.filter(a => a.id_paciente === selectedPaciente.id)
    : [];

  const handleResponderMensagem = () => {
    if (selectedMensagem) {
      const updatedMensagens = mensagens.map(msg => 
        msg.id === selectedMensagem.id ? { ...msg, lida: true } : msg
      );
      setMensagens(updatedMensagens);
      
      toast({
        title: "Mensagem enviada",
        description: `Resposta enviada para ${selectedMensagem.paciente}`,
      });
    }
  };

  const handleCancelarConsulta = (consultaId: number) => {
    const updatedConsultas = consultas.filter(c => c.id !== consultaId);
    setConsultas(updatedConsultas);
    
    toast({
      title: "Consulta cancelada",
      description: "A consulta foi cancelada e o paciente foi notificado",
    });
  };

  const handleSaveProntuario = (historico: HistoricoPaciente, acompanhamento: AcompanhamentoPaciente) => {
    const existingHistoricoIndex = historicos.findIndex(h => h.id_paciente === historico.id_paciente);
    
    if (existingHistoricoIndex >= 0) {
      const updatedHistoricos = [...historicos];
      updatedHistoricos[existingHistoricoIndex] = {
        ...updatedHistoricos[existingHistoricoIndex],
        ...historico,
        ultima_atualizacao: new Date().toISOString()
      };
      setHistoricos(updatedHistoricos);
    } else {
      setHistoricos([...historicos, {
        ...historico,
        id: historicos.length + 1,
        ultima_atualizacao: new Date().toISOString()
      }]);
    }
    
    setAcompanhamentos([...acompanhamentos, {
      ...acompanhamento,
      id: acompanhamentos.length + 1,
      data_registro: new Date().toISOString()
    }]);
    
    toast({
      title: "Prontuário atualizado",
      description: "As informações do paciente foram salvas com sucesso",
    });
  };

  return {
    pacientes: pacientesMock,
    receitas: receitasMock,
    consultas,
    mensagens,
    selectedPaciente,
    selectedMensagem,
    historicoPaciente,
    acompanhamentosPaciente,
    setConsultas,
    setMensagens,
    setSelectedPaciente,
    setSelectedMensagem,
    handleResponderMensagem,
    handleCancelarConsulta,
    handleSaveProntuario
  };
}
