
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, ArrowLeft } from 'lucide-react';
import { useDoctorSchedule } from '@/contexts/DoctorScheduleContext';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ProntuarioAbaProps {
  onBack: () => void;
}

const ProntuarioAba: React.FC<ProntuarioAbaProps> = ({ onBack }) => {
  const { toast } = useToast();
  const { selectedPaciente, handleSaveProntuario, historicoPaciente } = useDoctorSchedule();

  const [prontuarioData, setProntuarioData] = useState({
    condicoes_medicas: '',
    alergias: '',
    medicamentos_atuais: '',
    historico_familiar: '',
  });

  const [acompanhamentoData, setAcompanhamentoData] = useState({
    sintomas: '',
    efeitos_colaterais: '',
    eficacia: '',
    notas_adicionais: '',
  });

  useEffect(() => {
    if (historicoPaciente) {
      setProntuarioData({
        condicoes_medicas: historicoPaciente.condicoes_medicas || '',
        alergias: historicoPaciente.alergias || '',
        medicamentos_atuais: historicoPaciente.medicamentos_atuais || '',
        historico_familiar: historicoPaciente.historico_familiar || '',
      });
    }
  }, [historicoPaciente]);

  const handleSave = () => {
    if (selectedPaciente) {
      handleSaveProntuario({
        ...prontuarioData,
        id_paciente: selectedPaciente.id,
        ultima_atualizacao: new Date().toISOString(),
        acompanhamento: {
          ...acompanhamentoData,
          id_paciente: selectedPaciente.id,
          data_registro: new Date().toISOString(),
        }
      });
      
      toast({
        title: "Prontuário atualizado",
        description: "Informações salvas com sucesso.",
      });
    }
  };

  if (!selectedPaciente) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex flex-col items-center">
        <p className="text-gray-600 mb-4">Selecione um paciente para acessar o prontuário.</p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>
      <h2 className="text-2xl font-bold mb-6">Prontuário de {selectedPaciente.nome}</h2>
      <div className="space-y-6 py-4">
        <div>
          <h3 className="text-lg font-medium mb-4">Histórico Médico</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condicoes_medicas">Condições Médicas</Label>
              <Textarea 
                id="condicoes_medicas" 
                value={prontuarioData.condicoes_medicas}
                onChange={(e) => setProntuarioData({...prontuarioData, condicoes_medicas: e.target.value})}
                placeholder="Descreva as condições médicas do paciente" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alergias">Alergias</Label>
              <Textarea 
                id="alergias" 
                value={prontuarioData.alergias}
                onChange={(e) => setProntuarioData({...prontuarioData, alergias: e.target.value})}
                placeholder="Liste as alergias do paciente" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medicamentos_atuais">Medicamentos Atuais</Label>
              <Textarea 
                id="medicamentos_atuais" 
                value={prontuarioData.medicamentos_atuais}
                onChange={(e) => setProntuarioData({...prontuarioData, medicamentos_atuais: e.target.value})}
                placeholder="Liste os medicamentos atuais do paciente" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="historico_familiar">Histórico Familiar</Label>
              <Textarea 
                id="historico_familiar" 
                value={prontuarioData.historico_familiar}
                onChange={(e) => setProntuarioData({...prontuarioData, historico_familiar: e.target.value})}
                placeholder="Descreva o histórico familiar relevante" 
              />
            </div>
            
            {historicoPaciente?.ultima_atualizacao && (
              <div className="text-sm text-gray-500">
                Última atualização: {format(new Date(historicoPaciente.ultima_atualizacao), 'dd/MM/yyyy HH:mm')}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Novo Acompanhamento</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sintomas">Sintomas</Label>
              <Textarea 
                id="sintomas" 
                value={acompanhamentoData.sintomas}
                onChange={(e) => setAcompanhamentoData({...acompanhamentoData, sintomas: e.target.value})}
                placeholder="Descreva os sintomas atuais" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="efeitos_colaterais">Efeitos Colaterais</Label>
              <Textarea 
                id="efeitos_colaterais" 
                value={acompanhamentoData.efeitos_colaterais}
                onChange={(e) => setAcompanhamentoData({...acompanhamentoData, efeitos_colaterais: e.target.value})}
                placeholder="Descreva os efeitos colaterais observados" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eficacia">Eficácia do Tratamento</Label>
              <Textarea 
                id="eficacia" 
                value={acompanhamentoData.eficacia}
                onChange={(e) => setAcompanhamentoData({...acompanhamentoData, eficacia: e.target.value})}
                placeholder="Avalie a eficácia do tratamento atual" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notas_adicionais">Notas Adicionais</Label>
              <Textarea 
                id="notas_adicionais" 
                value={acompanhamentoData.notas_adicionais}
                onChange={(e) => setAcompanhamentoData({...acompanhamentoData, notas_adicionais: e.target.value})}
                placeholder="Adicione observações e notas relevantes" 
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-end mt-8">
        <Button type="button" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Prontuário
        </Button>
      </div>
    </div>
  );
};

export default ProntuarioAba;
