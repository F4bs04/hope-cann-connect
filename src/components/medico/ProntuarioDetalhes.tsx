
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useDoctorSchedule } from '@/contexts/DoctorScheduleContext';
import { Anamnese, SOAP } from '@/types/doctorScheduleTypes';

interface ProntuarioDetalhesProps {
  onBack: () => void;
}

const ProntuarioDetalhes: React.FC<ProntuarioDetalhesProps> = ({ onBack }) => {
  const { toast } = useToast();
  const { selectedPaciente, historicoPaciente, handleSaveProntuario } = useDoctorSchedule();
  const [isEditing, setIsEditing] = useState(false);
  
  const [prontuarioData, setProntuarioData] = useState({
    condicoes_medicas: historicoPaciente?.condicoes_medicas || '',
    alergias: historicoPaciente?.alergias || '',
    medicamentos_atuais: historicoPaciente?.medicamentos_atuais || '',
    historico_familiar: historicoPaciente?.historico_familiar || '',
  });

  const defaultAnamnese: Anamnese = {
    queixa_principal: '',
    historia_doenca_atual: '',
    historia_medica_pregressa: '',
    historia_familiar: '',
    habitos_vida: '',
    medicamentos_em_uso: ''
  };

  const defaultSoap: SOAP = {
    subjetivo: '',
    objetivo: '',
    avaliacao: '',
    plano: ''
  };

  const [anamneseData, setAnamneseData] = useState<Anamnese>({
    queixa_principal: historicoPaciente?.anamnese?.queixa_principal || '',
    historia_doenca_atual: historicoPaciente?.anamnese?.historia_doenca_atual || '',
    historia_medica_pregressa: historicoPaciente?.anamnese?.historia_medica_pregressa || '',
    historia_familiar: historicoPaciente?.anamnese?.historia_familiar || '',
    habitos_vida: historicoPaciente?.anamnese?.habitos_vida || '',
    medicamentos_em_uso: historicoPaciente?.anamnese?.medicamentos_em_uso || '',
  });

  const [soapData, setSoapData] = useState<SOAP>({
    subjetivo: historicoPaciente?.soap?.subjetivo || '',
    objetivo: historicoPaciente?.soap?.objetivo || '',
    avaliacao: historicoPaciente?.soap?.avaliacao || '',
    plano: historicoPaciente?.soap?.plano || '',
  });

  useEffect(() => {
    if (historicoPaciente) {
      setProntuarioData({
        condicoes_medicas: historicoPaciente.condicoes_medicas || '',
        alergias: historicoPaciente.alergias || '',
        medicamentos_atuais: historicoPaciente.medicamentos_atuais || '',
        historico_familiar: historicoPaciente.historico_familiar || '',
      });
      setAnamneseData({
        queixa_principal: historicoPaciente.anamnese?.queixa_principal || '',
        historia_doenca_atual: historicoPaciente.anamnese?.historia_doenca_atual || '',
        historia_medica_pregressa: historicoPaciente.anamnese?.historia_medica_pregressa || '',
        historia_familiar: historicoPaciente.anamnese?.historia_familiar || '',
        habitos_vida: historicoPaciente.anamnese?.habitos_vida || '',
        medicamentos_em_uso: historicoPaciente.anamnese?.medicamentos_em_uso || '',
      });
      setSoapData({
        subjetivo: historicoPaciente.soap?.subjetivo || '',
        objetivo: historicoPaciente.soap?.objetivo || '',
        avaliacao: historicoPaciente.soap?.avaliacao || '',
        plano: historicoPaciente.soap?.plano || '',
      });
    }
  }, [historicoPaciente]);

  const handleSave = () => {
    if (selectedPaciente) {
      const acompanhamentoData = {
        sintomas: '',
        efeitos_colaterais: '',
        eficacia: '',
        notas_adicionais: '',
        id_paciente: selectedPaciente.id,
        data_registro: new Date().toISOString(),
      };

      handleSaveProntuario({
        ...prontuarioData,
        id_paciente: selectedPaciente.id,
        ultima_atualizacao: new Date().toISOString(),
        anamnese: anamneseData,
        soap: soapData
      }, acompanhamentoData);
      
      setIsEditing(false);
      toast({
        title: "Prontuário atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    }
  };

  if (!selectedPaciente || !historicoPaciente) {
    return (
      <div className="p-8 text-center">
        <p>Nenhum prontuário selecionado</p>
        <Button onClick={onBack} className="mt-4">Voltar</Button>
      </div>
    );
  }

  const renderField = (label: string, value: string, field: string, stateKey: 'prontuario' | 'anamnese' | 'soap') => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      {isEditing ? (
        <Textarea
          id={field}
          value={
            stateKey === 'prontuario' 
              ? prontuarioData[field as keyof typeof prontuarioData] 
              : stateKey === 'anamnese'
              ? anamneseData[field as keyof typeof anamneseData]
              : soapData[field as keyof typeof soapData]
          }
          onChange={(e) => {
            if (stateKey === 'prontuario') {
              setProntuarioData(prev => ({ ...prev, [field]: e.target.value }));
            } else if (stateKey === 'anamnese') {
              setAnamneseData(prev => ({ ...prev, [field]: e.target.value }));
            } else {
              setSoapData(prev => ({ ...prev, [field]: e.target.value }));
            }
          }}
          className="min-h-[100px]"
        />
      ) : (
        <div className="p-4 bg-gray-50 rounded-md min-h-[100px] whitespace-pre-wrap">
          {stateKey === 'prontuario' 
            ? prontuarioData[field as keyof typeof prontuarioData] 
            : stateKey === 'anamnese'
            ? anamneseData[field as keyof typeof anamneseData]
            : soapData[field as keyof typeof soapData] || 'Não informado'}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Prontuário de {selectedPaciente.nome}</h2>
            <p className="text-sm text-gray-500">
              Última atualização: {format(new Date(historicoPaciente.ultima_atualizacao), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          variant={isEditing ? "default" : "outline"}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" /> Salvar Alterações
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" /> Editar Prontuário
            </>
          )}
        </Button>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Histórico Médico</h3>
          <div className="grid gap-6">
            {renderField('Condições Médicas', prontuarioData.condicoes_medicas, 'condicoes_medicas', 'prontuario')}
            {renderField('Alergias', prontuarioData.alergias, 'alergias', 'prontuario')}
            {renderField('Medicamentos Atuais', prontuarioData.medicamentos_atuais, 'medicamentos_atuais', 'prontuario')}
            {renderField('Histórico Familiar', prontuarioData.historico_familiar, 'historico_familiar', 'prontuario')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Anamnese</h3>
          <div className="grid gap-6">
            {renderField('Queixa Principal', anamneseData.queixa_principal, 'queixa_principal', 'anamnese')}
            {renderField('História da Doença Atual', anamneseData.historia_doenca_atual, 'historia_doenca_atual', 'anamnese')}
            {renderField('História Médica Pregressa', anamneseData.historia_medica_pregressa, 'historia_medica_pregressa', 'anamnese')}
            {renderField('História Familiar', anamneseData.historia_familiar, 'historia_familiar', 'anamnese')}
            {renderField('Hábitos de Vida', anamneseData.habitos_vida, 'habitos_vida', 'anamnese')}
            {renderField('Medicamentos em Uso', anamneseData.medicamentos_em_uso, 'medicamentos_em_uso', 'anamnese')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">SOAP - Registro Orientado por Problemas</h3>
          <div className="grid gap-6">
            {renderField('S - Subjetivo', soapData.subjetivo, 'subjetivo', 'soap')}
            {renderField('O - Objetivo', soapData.objetivo, 'objetivo', 'soap')}
            {renderField('A - Avaliação', soapData.avaliacao, 'avaliacao', 'soap')}
            {renderField('P - Plano', soapData.plano, 'plano', 'soap')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProntuarioDetalhes;
