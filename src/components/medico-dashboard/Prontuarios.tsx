
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, FileText, Calendar, User, Clock, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getProntuarios, getPacientes } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';
import NovoProntuario from './NovoProntuario';
import ProntuarioDetalhes from '@/components/medico/ProntuarioDetalhes';
import PacienteDetalhes from './PacienteDetalhes';
import { useDoctorSchedule } from '@/contexts/DoctorScheduleContext';

interface ProntuariosProps {
  onSelectPatient: (patientId: string) => void;
}

const Prontuarios: React.FC<ProntuariosProps> = ({ onSelectPatient }) => {
  const { toast } = useToast();
  const { setSelectedPaciente } = useDoctorSchedule();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [prontuarios, setProntuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProntuario, setShowNewProntuario] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPacienteDetails, setShowPacienteDetails] = useState(false);
  const [selectedProntuarioId, setSelectedProntuarioId] = useState<number | null>(null);
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Buscar o UUID do médico logado
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) {
          throw new Error('Usuário não autenticado');
        }

        // Buscar pacientes do médico
        const pacientesData = await getPacientes(user.user.id);
        
        // Para cada paciente, buscar seus prontuários mais recentes
        const pacientesComProntuarios = await Promise.all(
          pacientesData.map(async (paciente: any) => {
            try {
              const { data: prontuarios } = await supabase
                .from('medical_records')
                .select('*')
                .eq('patient_id', paciente.id)
                .order('created_at', { ascending: false })
                .limit(1);

              const prontuarioMaisRecente = prontuarios?.[0];
              
              return {
                id: prontuarioMaisRecente?.id || `temp-${paciente.id}`,
                id_paciente: paciente.id,
                pacientes: {
                  nome: paciente.profiles?.full_name || paciente.emergency_contact_name || 'Nome não informado',
                  data_nascimento: paciente.birth_date
                },
                diagnostico: prontuarioMaisRecente?.diagnosis || 'Sem diagnóstico',
                tratamento: prontuarioMaisRecente?.treatment || 'Sem tratamento definido',
                data_consulta: prontuarioMaisRecente?.created_at || paciente.created_at,
                status: prontuarioMaisRecente ? 'concluído' : 'pendente'
              };
            } catch (error) {
              console.error('Erro ao buscar prontuário do paciente:', error);
              return {
                id: `temp-${paciente.id}`,
                id_paciente: paciente.id,
                pacientes: {
                  nome: paciente.profiles?.full_name || paciente.emergency_contact_name || 'Nome não informado',
                  data_nascimento: paciente.birth_date
                },
                diagnostico: 'Sem diagnóstico',
                tratamento: 'Sem tratamento definido',
                data_consulta: paciente.created_at,
                status: 'pendente'
              };
            }
          })
        );
        
        setProntuarios(pacientesComProntuarios);
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
      }
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  const refreshProntuarios = async () => {
    const prontuariosData = await getProntuarios();
    setProntuarios(prontuariosData);
  };
  
  const filteredProntuarios = prontuarios.filter(prontuario => 
    (prontuario.pacientes?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prontuario.diagnostico?.toLowerCase().includes(searchQuery.toLowerCase()))
  ).filter(prontuario => {
    if (activeTab === 'todos') return true;
    if (activeTab === 'concluido') return prontuario.status === 'concluído';
    if (activeTab === 'pendente') return prontuario.status === 'pendente';
    if (activeTab === 'cancelado') return prontuario.status === 'cancelado';
    return true;
  });

  const handleSelectProntuario = (prontuario: any) => {
    setSelectedProntuarioId(prontuario.id);
    
    // Primeiro, precisamos obter o paciente completo pelo ID
    const getPacienteData = async () => {
      try {
        // Buscar o UUID do médico logado
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) {
          throw new Error('Usuário não autenticado');
        }

        const pacientesData = await getPacientes(user.user.id);
        const paciente = pacientesData.find((p: any) => 
          p && typeof p === 'object' && 'id' in p && p.id === prontuario.id_paciente
        );
        
        if (paciente) {
          // Type assertion after filtering ensures paciente is valid
          const validPaciente = paciente as { 
            id: string; 
            profiles?: { full_name?: string };
            emergency_contact_name?: string;
            birth_date?: string;
            medical_condition?: string;
          };
          
          // Atualiza o contexto global com o paciente selecionado
          setSelectedPaciente({
            id: validPaciente.id,
            nome: validPaciente.profiles?.full_name || validPaciente.emergency_contact_name || 'Nome não informado',
            idade: validPaciente.birth_date ? new Date().getFullYear() - new Date(validPaciente.birth_date).getFullYear() : 0,
            condicao: validPaciente.medical_condition || 'Condição não informada',
            ultimaConsulta: new Date().toISOString()
          });
          
          // Notifica o componente pai
          onSelectPatient(validPaciente.id);
          
          // Mostrar detalhes do paciente em vez de prontuário
          setSelectedPacienteId(validPaciente.id);
          setShowPacienteDetails(true);
        } else {
          toast({
            title: "Erro ao carregar paciente",
            description: "Não foi possível encontrar os dados do paciente.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Erro ao obter dados do paciente:", error);
        toast({
          title: "Erro ao carregar paciente",
          description: "Ocorreu um erro ao carregar os dados do paciente.",
          variant: "destructive"
        });
      }
    };
    
    getPacienteData();
  };
  
  if (showPacienteDetails && selectedPacienteId) {
    return (
      <PacienteDetalhes 
        pacienteId={selectedPacienteId} 
        onBack={() => {
          setShowPacienteDetails(false);
          setSelectedPacienteId(null);
        }} 
      />
    );
  }

  if (showDetails) {
    return <ProntuarioDetalhes onBack={() => setShowDetails(false)} />;
  }
  
  if (showNewProntuario) {
    return (
      <NovoProntuario 
        onBack={() => {
          setShowNewProntuario(false);
          refreshProntuarios();
        }} 
      />
    );
  }
  
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
          onClick={() => setShowNewProntuario(true)}
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
              onClick={() => handleSelectProntuario(prontuario)}
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
                        <h3 className="font-medium text-lg">{prontuario.pacientes?.nome}</h3>
                        <span className="text-sm text-gray-500 ml-4">{prontuario.pacientes?.data_nascimento ? new Date().getFullYear() - new Date(prontuario.pacientes.data_nascimento).getFullYear() : 'N/A'} anos</span>
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
                        {prontuario.pacientes?.nome}
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
                        handleSelectProntuario(prontuario);
                      }}
                    >
                      Ver paciente
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
    </div>
  );
};

export default Prontuarios;
