
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, User, Calendar, Phone, Mail, Clock, X, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePacientesData } from '@/hooks/usePacientesData';
import { searchAllPatients, addPatientToDoctor } from '@/services/pacientes/pacientesService';
import { PatientDuplicatesManager } from './PatientDuplicatesManager';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PacientesProps {
  onSelectPatient: (patientId: string) => void;
}

const Pacientes: React.FC<PacientesProps> = ({ onSelectPatient }) => {
  const { toast } = useToast();
  const { medicoId } = useAuth();
  const { 
    pacientes: patients, 
    isLoading: loading, 
    addPaciente, 
    setSearchTerm,
    addPatientToDoctor: addExistingPatient 
  } = usePacientesData();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  
  // Form state
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [condicao, setCondicao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [genero, setGenero] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cpf, setCpf] = useState('');
  
  const handleSearchExistingPatients = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setSearchingPatients(true);
    try {
      const results = await searchAllPatients(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching patients:', error);
    } finally {
      setSearchingPatients(false);
    }
  };

  const handleAddExistingPatient = async (patient: any) => {
    try {
      const result = await addExistingPatient(patient.id, 'Paciente adicionado via busca');
      if (result.success) {
        toast({
          title: "Paciente adicionado",
          description: `${patient.full_name || 'Paciente'} foi adicionado à sua lista`,
        });
        setShowSearchDialog(false);
        setPatientSearch('');
        setSearchResults([]);
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao adicionar paciente",
          description: "Não foi possível adicionar o paciente à sua lista",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o paciente",
      });
    }
  };
  
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
    
    if (!dataNascimento) {
      toast({
        variant: "destructive",
        title: "Data de nascimento obrigatória",
        description: "Por favor, insira a data de nascimento",
      });
      return;
    }
    
    console.log('[Pacientes] Iniciando cadastro de paciente...');
    
    const pacienteData = {
      full_name: nome, // Nome do paciente
      birth_date: dataNascimento,
      gender: genero,
      address: endereco,
      cpf,
      medical_condition: condicao,
      emergency_contact_phone: telefone,
      user_id: null // Paciente criado pelo médico, sem conta ainda
    };
    
    console.log('[Pacientes] Dados do paciente:', pacienteData);
    
    const result = await addPaciente(pacienteData);
    
    console.log('[Pacientes] Resultado do cadastro:', result);
    
    if (result.success) {
      toast({
        title: "Paciente cadastrado",
        description: "Paciente cadastrado com sucesso",
      });
      resetForm();
      setOpenDialog(false);
    } else {
      console.error('[Pacientes] Erro detalhado:', result.error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: result.error?.message || "Não foi possível cadastrar o paciente",
      });
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
    setCpf('');
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pacientes</h1>
        <p className="text-gray-600">
          Gerencie seus pacientes, histórico de consultas e duplicatas
        </p>
      </div>
      
      <Tabs defaultValue="lista" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="lista">Lista de Pacientes</TabsTrigger>
          <TabsTrigger value="duplicatas" className="relative">
            Duplicatas
            <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-xs">
              !
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="lista" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar nos seus pacientes..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowSearchDialog(true)}
              >
                <Search className="h-4 w-4 mr-2" /> Buscar Existente
              </Button>
              <Button 
                className="bg-[#00B3B0] hover:bg-[#009E9B]"
                onClick={() => setOpenDialog(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" /> Novo Paciente
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <p>Carregando pacientes...</p>
            </div>
          ) : patients.length > 0 ? (
            <div className="grid gap-4">
              {patients.map(patient => (
                <Card 
                  key={patient.id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onSelectPatient(patient.id)}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-[#00B3B0] p-4 text-white flex items-center justify-center md:w-16">
                        <User className="h-8 w-8" />
                      </div>
                      
                      <div className="p-4 flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                          <h3 className="font-medium text-lg">{patient.full_name || 'Nome não informado'}</h3>
                          <span className="text-sm text-gray-500 md:ml-4">
                            {patient.birth_date ? new Date().getFullYear() - new Date(patient.birth_date).getFullYear() : 'Idade não informada'} anos
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{patient.medical_condition || 'Condição não informada'}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          {patient.emergency_contact_phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              {patient.emergency_contact_phone}
                            </div>
                          )}
                           {patient.cpf && (
                             <div className="flex items-center">
                               <Mail className="h-4 w-4 mr-2 text-gray-400" />
                               CPF: {patient.cpf}
                             </div>
                           )}
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            Cadastrado: {new Date(patient.created_at).toLocaleDateString()}
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
                            onSelectPatient(patient.id);
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
        </TabsContent>
        
        <TabsContent value="duplicatas">
          <PatientDuplicatesManager />
        </TabsContent>
      </Tabs>
      
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
                   <Label htmlFor="dataNascimento" className="text-right">
                     Data de Nascimento*
                   </Label>
                   <Input
                     id="dataNascimento"
                     type="date"
                     value={dataNascimento}
                     onChange={(e) => setDataNascimento(e.target.value)}
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
                   <Label htmlFor="cpf" className="text-right">
                     CPF
                   </Label>
                   <Input
                     id="cpf"
                     value={cpf}
                     onChange={(e) => setCpf(e.target.value)}
                     className="mt-1"
                     placeholder="000.000.000-00"
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

      {/* Search Existing Patients Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Buscar Paciente Existente</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="patientSearch">
              Digite o nome, email ou CPF do paciente
            </Label>
            <Input
              id="patientSearch"
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                handleSearchExistingPatients(e.target.value);
              }}
              placeholder="Buscar paciente..."
              className="mt-2"
            />
            
            {searchingPatients && (
              <p className="text-sm text-gray-500 mt-2">Buscando...</p>
            )}
            
            {searchResults.length > 0 && (
              <div className="mt-4 max-h-60 overflow-y-auto">
                <h4 className="font-medium mb-2">Resultados encontrados:</h4>
                {searchResults.map((patient) => (
                  <div key={patient.id} className="border rounded p-3 mb-2 flex justify-between items-center">
                    <div>
                        <p className="font-medium">{patient.full_name || 'Nome não informado'}</p>
                        <p className="text-sm text-gray-600">{patient.cpf ? `CPF: ${patient.cpf}` : 'CPF não informado'}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddExistingPatient(patient)}
                    >
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {patientSearch.length >= 3 && !searchingPatients && searchResults.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">Nenhum paciente encontrado</p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowSearchDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pacientes;
