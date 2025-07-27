import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Edit, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useDoctorSchedule } from '@/contexts/DoctorScheduleContext';
import { Anamnese, SOAP } from '@/types/doctorScheduleTypes';
import html2pdf from 'html2pdf.js';

interface ProntuarioDetalhesProps {
  onBack: () => void;
}

const ProntuarioDetalhes: React.FC<ProntuarioDetalhesProps> = ({ onBack }) => {
  const { toast } = useToast();
  const { selectedPaciente, historicoPaciente, handleSaveProntuario } = useDoctorSchedule();
  const [isEditing, setIsEditing] = useState(false);
  const prontuarioRef = React.useRef<HTMLDivElement>(null);
  
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

  const [anamneseData, setAnamneseData] = useState<Anamnese>(
    historicoPaciente?.anamnese || defaultAnamnese
  );

  const [soapData, setSoapData] = useState<SOAP>(
    historicoPaciente?.soap || defaultSoap
  );

  useEffect(() => {
    if (historicoPaciente) {
      setProntuarioData({
        condicoes_medicas: historicoPaciente.condicoes_medicas || '',
        alergias: historicoPaciente.alergias || '',
        medicamentos_atuais: historicoPaciente.medicamentos_atuais || '',
        historico_familiar: historicoPaciente.historico_familiar || '',
      });
      
      setAnamneseData(historicoPaciente.anamnese || defaultAnamnese);
      setSoapData(historicoPaciente.soap || defaultSoap);
    }
  }, [historicoPaciente]);

  const handleSave = async () => {
    if (handleSaveProntuario) {
      await handleSaveProntuario({
        ...prontuarioData,
        anamnese: anamneseData,
        soap: soapData,
        consulta: {
          data_consulta: new Date().toISOString(),
          sintomas: '',
          exame_fisico: '',
          diagnostico: '',
          tratamento: '',
          observacoes: '',
          prescricoes: '',
          retorno: '',
          eficacia: '',
          notas_adicionais: '',
          id_paciente: selectedPaciente.id,
          data_registro: new Date().toISOString(),
        }
      });
      
      setIsEditing(false);
      toast({
        title: "Prontuário atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (prontuarioRef.current) {
      try {
        const element = prontuarioRef.current;
        const opt = {
          margin: 1,
          filename: `prontuario-${selectedPaciente.nome.replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        await html2pdf().set(opt).from(element).save();
        
        toast({
          title: "Download concluído",
          description: "O prontuário foi baixado como PDF",
        });
      } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        toast({
          variant: "destructive",
          title: "Erro ao gerar PDF",
          description: "Não foi possível baixar o prontuário como PDF",
        });
      }
    }
  };

  const handlePrint = () => {
    window.print();
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
              Última atualização: {format(new Date(historicoPaciente.ultima_atualizacao || new Date()), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" /> Baixar PDF
          </Button>
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
      </div>

      <div ref={prontuarioRef} className="space-y-8 print:p-0">
        <div className="bg-white p-6 rounded-lg border print:border-0 print:shadow-none">
          <h3 className="text-lg font-semibold mb-4 print:text-xl print:font-bold">Histórico Médico</h3>
          <div className="grid gap-6">
            {renderField('Condições Médicas', prontuarioData.condicoes_medicas, 'condicoes_medicas', 'prontuario')}
            {renderField('Alergias', prontuarioData.alergias, 'alergias', 'prontuario')}
            {renderField('Medicamentos Atuais', prontuarioData.medicamentos_atuais, 'medicamentos_atuais', 'prontuario')}
            {renderField('Histórico Familiar', prontuarioData.historico_familiar, 'historico_familiar', 'prontuario')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border print:border-0 print:shadow-none">
          <h3 className="text-lg font-semibold mb-4 print:text-xl print:font-bold">Anamnese</h3>
          <div className="grid gap-6">
            {renderField('Queixa Principal', anamneseData.queixa_principal, 'queixa_principal', 'anamnese')}
            {renderField('História da Doença Atual', anamneseData.historia_doenca_atual, 'historia_doenca_atual', 'anamnese')}
            {renderField('História Médica Pregressa', anamneseData.historia_medica_pregressa, 'historia_medica_pregressa', 'anamnese')}
            {renderField('História Familiar', anamneseData.historia_familiar, 'historia_familiar', 'anamnese')}
            {renderField('Hábitos de Vida', anamneseData.habitos_vida, 'habitos_vida', 'anamnese')}
            {renderField('Medicamentos em Uso', anamneseData.medicamentos_em_uso, 'medicamentos_em_uso', 'anamnese')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border print:border-0 print:shadow-none">
          <h3 className="text-lg font-semibold mb-4 print:text-xl print:font-bold">SOAP - Registro Orientado por Problemas</h3>
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
