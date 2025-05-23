import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPacientes, createProntuario } from '@/services/supabaseService';

interface NovoProntuarioProps {
  onBack: () => void;
}

const NovoProntuario: React.FC<NovoProntuarioProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [pacientes, setPacientes] = useState<any[]>([]);
  
  const [pacienteId, setPacienteId] = useState('');
  const [dataConsulta, setDataConsulta] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamento, setTratamento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState('concluído');
  const [loading, setLoading] = useState(false);
  
  const [anamnese, setAnamnese] = useState({
    queixaPrincipal: '',
    historiaDoencaAtual: '',
    historiaMedicaPregressa: '',
    historiaFamiliar: '',
    habitosVida: '',
    medicamentosEmUso: '',
  });
  
  const [soap, setSoap] = useState({
    subjetivo: '',
    objetivo: '',
    avaliacao: '',
    plano: '',
  });
  
  useEffect(() => {
    const loadPacientes = async () => {
      const pacientesData = await getPacientes();
      setPacientes(pacientesData);
    };
    
    loadPacientes();
  }, []);
  
  const handleCreateProntuario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pacienteId) {
      toast({
        variant: "destructive",
        title: "Paciente obrigatório",
        description: "Por favor, selecione um paciente",
      });
      return;
    }
    
    if (!diagnostico) {
      toast({
        variant: "destructive",
        title: "Diagnóstico obrigatório",
        description: "Por favor, insira um diagnóstico",
      });
      return;
    }
    
    setLoading(true);
    
    const prontuarioData = {
      id_paciente: parseInt(pacienteId),
      data_consulta: dataConsulta ? new Date(dataConsulta).toISOString() : new Date().toISOString(),
      sintomas,
      diagnostico,
      tratamento,
      observacoes,
      status,
      anamnese,
      soap,
    };
    
    const newProntuario = await createProntuario(prontuarioData);
    
    if (newProntuario) {
      toast({
        title: "Prontuário criado",
        description: "O prontuário foi criado com sucesso",
        duration: 3000,
      });
      
      resetForm();
      onBack();
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao criar prontuário",
        description: "Ocorreu um erro ao criar o prontuário",
      });
    }
    
    setLoading(false);
  };
  
  const resetForm = () => {
    setPacienteId('');
    setDataConsulta('');
    setSintomas('');
    setDiagnostico('');
    setTratamento('');
    setObservacoes('');
    setStatus('concluído');
    setAnamnese({
      queixaPrincipal: '',
      historiaDoencaAtual: '',
      historiaMedicaPregressa: '',
      historiaFamiliar: '',
      habitosVida: '',
      medicamentosEmUso: '',
    });
    setSoap({
      subjetivo: '',
      objetivo: '',
      avaliacao: '',
      plano: '',
    });
  };
  
  return (
    <div className="w-full">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Novo Prontuário</h1>
          <p className="text-gray-600">
            Crie um novo registro médico para o paciente
          </p>
        </div>
      </div>
      
      <form onSubmit={handleCreateProntuario} className="space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paciente" className="text-right">
              Paciente*
            </Label>
            <Select value={pacienteId} onValueChange={setPacienteId} required>
              <SelectTrigger id="paciente" className="mt-1">
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent>
                {pacientes.map(paciente => (
                  <SelectItem key={paciente.id} value={paciente.id.toString()}>
                    {paciente.nome} ({paciente.idade} anos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="dataConsulta" className="text-right">
              Data da Consulta
            </Label>
            <Input
              id="dataConsulta"
              type="datetime-local"
              value={dataConsulta}
              onChange={(e) => setDataConsulta(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Anamnese</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="queixaPrincipal">Queixa Principal</Label>
              <Textarea
                id="queixaPrincipal"
                value={anamnese.queixaPrincipal}
                onChange={(e) => setAnamnese({...anamnese, queixaPrincipal: e.target.value})}
                placeholder="Descreva a queixa principal do paciente"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="historiaDoencaAtual">História da Doença Atual</Label>
              <Textarea
                id="historiaDoencaAtual"
                value={anamnese.historiaDoencaAtual}
                onChange={(e) => setAnamnese({...anamnese, historiaDoencaAtual: e.target.value})}
                placeholder="Descreva a história da doença atual"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="historiaMedicaPregressa">História Médica Pregressa</Label>
              <Textarea
                id="historiaMedicaPregressa"
                value={anamnese.historiaMedicaPregressa}
                onChange={(e) => setAnamnese({...anamnese, historiaMedicaPregressa: e.target.value})}
                placeholder="Descreva a história médica pregressa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="historiaFamiliar">História Familiar</Label>
              <Textarea
                id="historiaFamiliar"
                value={anamnese.historiaFamiliar}
                onChange={(e) => setAnamnese({...anamnese, historiaFamiliar: e.target.value})}
                placeholder="Descreva a história familiar relevante"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="habitosVida">Hábitos de Vida</Label>
              <Textarea
                id="habitosVida"
                value={anamnese.habitosVida}
                onChange={(e) => setAnamnese({...anamnese, habitosVida: e.target.value})}
                placeholder="Descreva os hábitos de vida do paciente"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medicamentosEmUso">Medicamentos em Uso</Label>
              <Textarea
                id="medicamentosEmUso"
                value={anamnese.medicamentosEmUso}
                onChange={(e) => setAnamnese({...anamnese, medicamentosEmUso: e.target.value})}
                placeholder="Liste os medicamentos em uso"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">SOAP - Registro Orientado por Problemas</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subjetivo">S - Subjetivo</Label>
              <Textarea
                id="subjetivo"
                value={soap.subjetivo}
                onChange={(e) => setSoap({...soap, subjetivo: e.target.value})}
                placeholder="Relato do paciente, sintomas e sensações"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="objetivo">O - Objetivo</Label>
              <Textarea
                id="objetivo"
                value={soap.objetivo}
                onChange={(e) => setSoap({...soap, objetivo: e.target.value})}
                placeholder="Dados do exame físico e resultados de exames"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avaliacao">A - Avaliação</Label>
              <Textarea
                id="avaliacao"
                value={soap.avaliacao}
                onChange={(e) => setSoap({...soap, avaliacao: e.target.value})}
                placeholder="Avaliação dos problemas e diagnósticos"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plano">P - Plano</Label>
              <Textarea
                id="plano"
                value={soap.plano}
                onChange={(e) => setSoap({...soap, plano: e.target.value})}
                placeholder="Plano de tratamento e condutas"
                rows={4}
              />
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="sintomas" className="text-right">
            Sintomas
          </Label>
          <Textarea
            id="sintomas"
            value={sintomas}
            onChange={(e) => setSintomas(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="diagnostico" className="text-right">
            Diagnóstico*
          </Label>
          <Textarea
            id="diagnostico"
            value={diagnostico}
            onChange={(e) => setDiagnostico(e.target.value)}
            className="mt-1"
            rows={3}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="tratamento" className="text-right">
            Tratamento
          </Label>
          <Textarea
            id="tratamento"
            value={tratamento}
            onChange={(e) => setTratamento(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="observacoes" className="text-right">
            Observações
          </Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="status" className="text-right">
            Status
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status" className="mt-1">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concluído">Concluído</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : (
              <>
                <Save className="h-4 w-4 mr-2" /> Criar Prontuário
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NovoProntuario;
