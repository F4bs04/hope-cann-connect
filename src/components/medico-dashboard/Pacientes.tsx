
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, User, Calendar, Phone, Mail, Clock, X, FileText, MapPin, CalendarDays, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getPacientes, createPaciente, getPacienteById } from '@/services/supabaseService';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PacientesProps {
  onSelectPatient: (patientId: number) => void;
}

const Pacientes: React.FC<PacientesProps> = ({ onSelectPatient }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [patientDetailsOpen, setPatientDetailsOpen] = useState(false);
  const [loadingPatientDetails, setLoadingPatientDetails] = useState(false);
  
  // Form state
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [condicao, setCondicao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [genero, setGenero] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [endereco, setEndereco] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      const data = await getPacientes();
      setPatients(data);
      setLoading(false);
    };
    
    loadPatients();
  }, []);
  
  const filteredPatients = patients.filter(patient => 
    patient.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.condicao?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!nome) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "Por favor, insira o nome do paciente",
      });
      return;
    }
    
    if (!idade || isNaN(Number(idade))) {
      toast({
        variant: "destructive",
        title: "Idade inválida",
        description: "Por favor, insira uma idade válida",
      });
      return;
    }
    
    const pacienteData = {
      nome,
      idade: parseInt(idade),
      condicao,
      telefone,
      email,
      genero,
      data_nascimento: dataNascimento || null,
      endereco,
    };
    
    const newPatient = await createPaciente(pacienteData);
    
    if (newPatient) {
      setPatients([...patients, newPatient]);
      resetForm();
      setOpenDialog(false);
    }
  };
  
  const resetForm = () => {
    setNome('');
    setIdade('');
    setCondicao('');
    setTelefone('');
    setEmail('');
    setGenero('');
    setDataNascimento('');
    setEndereco('');
  };
  
  const handleViewPatientDetails = async (patientId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setLoadingPatientDetails(true);
    setPatientDetailsOpen(true);
    
    try {
      const patientData = await getPacienteById(patientId);
      setSelectedPatient(patientData);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os detalhes do paciente.",
      });
    } finally {
      setLoadingPatientDetails(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pacientes</h1>
        <p className="text-gray-600">
          Gerencie seus pacientes e histórico de consultas
        </p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar paciente por nome ou condição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button 
          className="bg-[#00B3B0] hover:bg-[#009E9B]"
          onClick={() => setOpenDialog(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" /> Novo Paciente
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <p>Carregando pacientes...</p>
        </div>
      ) : filteredPatients.length > 0 ? (
        <div className="grid gap-4">
          {filteredPatients.map(patient => (
            <Card 
              key={patient.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={(e) => handleViewPatientDetails(patient.id, e)}
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-[#00B3B0] p-4 text-white flex items-center justify-center md:w-16">
                    <User className="h-8 w-8" />
                  </div>
                  
                  <div className="p-4 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h3 className="font-medium text-lg">{patient.nome}</h3>
                      <span className="text-sm text-gray-500 md:ml-4">{patient.idade} anos</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{patient.condicao}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      {patient.telefone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {patient.telefone}
                        </div>
                      )}
                      {patient.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {patient.email}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        Última consulta: {new Date(patient.ultima_consulta).toLocaleDateString()}
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
                        // Handle scheduling here
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" /> Agendar
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPatientDetails(patient.id);
                      }}
                    >
                      Ver prontuário
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Nenhum paciente encontrado</p>
        </div>
      )}
      
      {/* Novo Paciente Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Paciente</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreatePatient}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome" className="text-right">
                    Nome completo*
                  </Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="idade" className="text-right">
                    Idade*
                  </Label>
                  <Input
                    id="idade"
                    type="number"
                    value={idade}
                    onChange={(e) => setIdade(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="condicao" className="text-right">
                  Condição ou diagnóstico
                </Label>
                <Input
                  id="condicao"
                  value={condicao}
                  onChange={(e) => setCondicao(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone" className="text-right">
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="genero" className="text-right">
                    Gênero
                  </Label>
                  <Select value={genero} onValueChange={setGenero}>
                    <SelectTrigger id="genero" className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dataNascimento" className="text-right">
                    Data de Nascimento
                  </Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="endereco" className="text-right">
                  Endereço
                </Label>
                <Textarea
                  id="endereco"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Cadastrar Paciente</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Paciente */}
      <Dialog open={patientDetailsOpen} onOpenChange={setPatientDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {loadingPatientDetails ? "Carregando detalhes do paciente..." : "Ficha do Paciente"}
            </DialogTitle>
          </DialogHeader>
          {loadingPatientDetails ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full" />
            </div>
          ) : selectedPatient ? (
            <>
              <DialogDescription className="text-base text-gray-500">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-6 w-6 text-hopecann-teal" />
                  <span className="text-xl font-medium">Informações detalhadas do paciente</span>
                </div>
              </DialogDescription>

              <div className="space-y-6 py-4">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Foto/Avatar do paciente */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="h-32 w-32 rounded-full bg-hopecann-teal/10 flex items-center justify-center">
                      <User className="h-16 w-16 text-hopecann-teal" />
                    </div>
                    <span className="mt-3 font-medium text-center">{selectedPatient.nome}</span>
                    <span className="text-sm text-gray-500">{selectedPatient.idade} anos</span>
                    {selectedPatient.genero && (
                      <Badge variant="outline" className="mt-2">
                        {selectedPatient.genero === 'masculino' ? 'Masculino' : 
                         selectedPatient.genero === 'feminino' ? 'Feminino' : 'Outro'}
                      </Badge>
                    )}
                  </div>

                  {/* Informações principais */}
                  <div className="flex-grow space-y-4">
                    <Tabs defaultValue="info" className="w-full">
                      <TabsList className="mb-4">
                        <TabsTrigger value="info">Informações</TabsTrigger>
                        <TabsTrigger value="historico">Histórico Médico</TabsTrigger>
                        <TabsTrigger value="consultas">Consultas</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="info" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border border-hopecann-green/20 p-4 rounded-lg bg-hopecann-green/5">
                            <h3 className="font-medium flex items-center gap-2 mb-3">
                              <Users className="h-4 w-4 text-hopecann-teal" />
                              Informações Pessoais
                            </h3>
                            <div className="space-y-2">
                              {selectedPatient.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{selectedPatient.email}</span>
                                </div>
                              )}
                              {selectedPatient.telefone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{selectedPatient.telefone}</span>
                                </div>
                              )}
                              {selectedPatient.data_nascimento && (
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">Nascimento: {new Date(selectedPatient.data_nascimento).toLocaleDateString()}</span>
                                </div>
                              )}
                              {selectedPatient.endereco && (
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                  <span className="text-sm">{selectedPatient.endereco}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="border border-hopecann-green/20 p-4 rounded-lg bg-hopecann-green/5">
                            <h3 className="font-medium flex items-center gap-2 mb-3">
                              <FileText className="h-4 w-4 text-hopecann-teal" />
                              Informações Clínicas
                            </h3>
                            <div className="space-y-2">
                              {selectedPatient.condicao && (
                                <div>
                                  <span className="text-sm font-medium">Condição/Diagnóstico:</span>
                                  <p className="text-sm mt-1">{selectedPatient.condicao}</p>
                                </div>
                              )}
                              {selectedPatient.medicacoes && (
                                <div>
                                  <span className="text-sm font-medium">Medicações em uso:</span>
                                  <p className="text-sm mt-1">{selectedPatient.medicacoes}</p>
                                </div>
                              )}
                              {selectedPatient.alergias && (
                                <div>
                                  <span className="text-sm font-medium">Alergias:</span>
                                  <p className="text-sm mt-1">{selectedPatient.alergias}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="border border-hopecann-green/20 p-4 rounded-lg bg-hopecann-green/5">
                          <h3 className="font-medium flex items-center gap-2 mb-3">
                            <FileText className="h-4 w-4 text-hopecann-teal" />
                            Observações
                          </h3>
                          <p className="text-sm">
                            {selectedPatient.observacoes || "Sem observações registradas"}
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="historico" className="space-y-4">
                        <div className="border border-hopecann-green/20 p-4 rounded-lg bg-hopecann-green/5">
                          <h3 className="font-medium mb-3">Histórico Médico</h3>
                          {selectedPatient.historico_medico ? (
                            <div className="space-y-4">
                              <p className="text-sm">{selectedPatient.historico_medico}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Nenhum histórico médico registrado</p>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="consultas" className="space-y-4">
                        <div className="border border-hopecann-green/20 p-4 rounded-lg bg-hopecann-green/5">
                          <h3 className="font-medium mb-3">Consultas Anteriores</h3>
                          {selectedPatient.consultas && selectedPatient.consultas.length > 0 ? (
                            <div className="space-y-3">
                              {selectedPatient.consultas.map((consulta: any, index: number) => (
                                <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                                  <div className="flex justify-between items-start">
                                    <span className="font-medium">{new Date(consulta.data_hora).toLocaleDateString()}</span>
                                    <Badge variant={consulta.status === 'realizada' ? 'default' : 'outline'}>
                                      {consulta.status === 'realizada' ? 'Realizada' : 'Agendada'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm mt-1">{consulta.motivo || "Sem motivo registrado"}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Nenhuma consulta registrada</p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  onClick={() => setPatientDetailsOpen(false)} 
                  className="sm:mr-auto"
                >
                  Fechar
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-hopecann-teal text-hopecann-teal hover:bg-hopecann-teal/10"
                    onClick={() => {
                      setPatientDetailsOpen(false);
                      // Lógica para agendar consulta
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Consulta
                  </Button>
                  <Button
                    className="bg-hopecann-teal hover:bg-hopecann-teal/90"
                    onClick={() => {
                      setPatientDetailsOpen(false);
                      onSelectPatient(selectedPatient.id);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Prontuário
                  </Button>
                </div>
              </DialogFooter>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">Paciente não encontrado</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pacientes;
