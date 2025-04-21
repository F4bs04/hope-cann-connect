import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, FileText, Calendar, User, Clock, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getProntuarios, getPacientes, createProntuario } from '@/services/supabaseService';

interface ProntuariosProps {
  onSelectPatient: (patientId: number) => void;
}

const Prontuarios: React.FC<ProntuariosProps> = ({ onSelectPatient }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [prontuarios, setProntuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [pacientes, setPacientes] = useState<any[]>([]);
  
  // Form state
  const [pacienteId, setPacienteId] = useState('');
  const [dataConsulta, setDataConsulta] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamento, setTratamento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState('concluído');
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const prontuariosData = await getProntuarios();
      setProntuarios(prontuariosData);
      
      const pacientesData = await getPacientes();
      setPacientes(pacientesData);
      
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  const filteredProntuarios = prontuarios.filter(prontuario => 
    (prontuario.pacientes_app?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prontuario.diagnostico?.toLowerCase().includes(searchQuery.toLowerCase()))
  ).filter(prontuario => {
    if (activeTab === 'todos') return true;
    if (activeTab === 'concluido') return prontuario.status === 'concluído';
    if (activeTab === 'pendente') return prontuario.status === 'pendente';
    if (activeTab === 'cancelado') return prontuario.status === 'cancelado';
    return true;
  });
  
  const handleCreateProntuario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
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
    
    const prontuarioData = {
      id_paciente: parseInt(pacienteId),
      data_consulta: dataConsulta ? new Date(dataConsulta).toISOString() : new Date().toISOString(),
      sintomas,
      diagnostico,
      tratamento,
      observacoes,
      status
    };
    
    const newProntuario = await createProntuario(prontuarioData);
    
    if (newProntuario) {
      // Reload prontuarios to get the joined data
      const updatedProntuarios = await getProntuarios();
      setProntuarios(updatedProntuarios);
      
      resetForm();
      setOpenDialog(false);
    }
  };
  
  const resetForm = () => {
    setPacienteId('');
    setDataConsulta('');
    setSintomas('');
    setDiagnostico('');
    setTratamento('');
    setObservacoes('');
    setStatus('concluído');
  };
  
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prontuários</h1>
        <p className="text-gray-600">
          Histórico médico e evolução dos pacientes
        </p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar prontuário por paciente ou diagnóstico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button 
          className="bg-[#00B3B0] hover:bg-[#009E9B]"
          onClick={() => setOpenDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Novo Prontuário
        </Button>
      </div>
      
      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="concluido">Concluídos</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="cancelado">Cancelados</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {loading ? (
        <div className="text-center py-10">
          <p>Carregando prontuários...</p>
        </div>
      ) : filteredProntuarios.length > 0 ? (
        <div className="grid gap-4">
          {filteredProntuarios.map(prontuario => (
            <Card 
              key={prontuario.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectPatient(prontuario.id_paciente)}
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div 
                    className={`
                      p-4 text-white flex items-center justify-center md:w-16
                      ${prontuario.status === 'concluído' ? 'bg-green-500' : 
                        prontuario.status === 'pendente' ? 'bg-amber-500' : 
                        'bg-red-500'}
                    `}
                  >
                    <FileText className="h-8 w-8" />
                  </div>
                  
                  <div className="p-4 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <div className="flex items-center">
                        <h3 className="font-medium text-lg">{prontuario.pacientes_app?.nome}</h3>
                        <span className="text-sm text-gray-500 ml-4">{prontuario.pacientes_app?.idade} anos</span>
                      </div>
                      <div 
                        className={`
                          text-xs px-2 py-1 rounded-full mt-2 md:mt-0 inline-block
                          ${prontuario.status === 'concluído' ? 'bg-green-100 text-green-700' : 
                            prontuario.status === 'pendente' ? 'bg-amber-100 text-amber-700' : 
                            'bg-red-100 text-red-700'}
                        `}
                      >
                        {prontuario.status.charAt(0).toUpperCase() + prontuario.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Diagnóstico:</span> {prontuario.diagnostico}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Tratamento:</span> {prontuario.tratamento}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        Consulta: {new Date(prontuario.data_consulta).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <User className="h-3.5 w-3.5 mr-1" />
                        Paciente #{prontuario.id_paciente}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        Última atualização: {new Date(prontuario.data_consulta).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 flex flex-col gap-2 justify-center md:w-48">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        // No modal/pop-up: implementação futura de edição pode ser aqui.
                      }}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPatient(prontuario.id_paciente);
                      }}
                    >
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg border">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-600 mb-1">Nenhum prontuário encontrado</h3>
          <p className="text-gray-500 mb-4">Não encontramos prontuários com esses critérios de busca</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setActiveTab('todos');
            }}
            className="mx-auto"
          >
            <X className="h-4 w-4 mr-2" /> Limpar filtros
          </Button>
        </div>
      )}
      
      {/* Novo Prontuário Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar Novo Prontuário</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateProntuario}>
            <div className="grid gap-4 py-4">
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
              
              <div>
                <Label htmlFor="sintomas" className="text-right">
                  Sintomas
                </Label>
                <Textarea
                  id="sintomas"
                  value={sintomas}
                  onChange={(e) => setSintomas(e.target.value)}
                  className="mt-1"
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
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar Prontuário</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prontuarios;
