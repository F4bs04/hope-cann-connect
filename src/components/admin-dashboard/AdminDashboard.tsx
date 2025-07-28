import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserCheck, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Plus,
  Mail,
  Phone,
  Calendar,
  Activity,
  Shield,
  UserX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getPacientes, getMedicos } from '@/services/supabaseService';

interface Patient {
  id: string;
  address: string;
  birth_date: string;
  cpf: string;
  created_at: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  gender: string;
  medical_condition: string;
  updated_at: string;
  user_id: string;
  profiles?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  // Campos derivados para compatibilidade
  nome?: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
}

interface Doctor {
  id: string;
  approved_at: string | null;
  biography: string | null;
  clinic_id: string | null;
  consultation_fee: number | null;
  cpf: string;
  created_at: string;
  crm: string;
  is_approved: boolean;
  is_available: boolean;
  specialty: string;
  updated_at: string;
  user_id: string;
  profiles?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  // Campos derivados para compatibilidade
  nome?: string;
  email?: string;
  telefone?: string;
  especialidade?: string;
}

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('patients');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientsData, doctorsData] = await Promise.all([
        getPacientes(),
        getMedicos()
      ]);
      
      // Mapear dados dos pacientes para incluir campos derivados - apenas dados reais
      const mappedPatients = (patientsData || [])
        .filter(patient => patient.profiles?.full_name) // Apenas pacientes com nome real
        .map(patient => ({
          ...patient,
          nome: patient.profiles?.full_name,
          email: patient.profiles?.email,
          telefone: patient.emergency_contact_phone,
          data_nascimento: patient.birth_date
        }));
      
      // Mapear dados dos médicos para incluir campos derivados - apenas dados reais
      const mappedDoctors = (doctorsData || [])
        .filter(doctor => doctor.profiles?.full_name && doctor.crm) // Apenas médicos com nome real e CRM
        .map(doctor => ({
          ...doctor,
          nome: doctor.profiles?.full_name,
          email: doctor.profiles?.email,
          especialidade: doctor.specialty
        }));
      
      setPatients(mappedPatients);
      setDoctors(mappedDoctors);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    // TODO: Implementar exclusão de paciente
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A exclusão de pacientes será implementada em breve",
      variant: "default"
    });
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    // TODO: Implementar exclusão de médico
    toast({
      title: "Funcionalidade em desenvolvimento", 
      description: "A exclusão de médicos será implementada em breve",
      variant: "default"
    });
  };

  const filteredPatients = patients.filter(patient =>
    patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf?.includes(searchTerm)
  );

  const filteredDoctors = doctors.filter(doctor =>
    doctor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.crm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.especialidade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PatientCard = ({ patient }: { patient: Patient }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar>
              <AvatarImage src={patient.profiles?.avatar_url} />
              <AvatarFallback>
                {patient.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{patient.nome}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                {patient.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{patient.email}</span>
                  </div>
                )}
                {patient.telefone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{patient.telefone}</span>
                  </div>
                )}
                {patient.data_nascimento && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Nascimento: {format(new Date(patient.data_nascimento), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>Cadastrado em: {format(new Date(patient.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleDeletePatient(patient.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar>
              <AvatarImage src={doctor.profiles?.avatar_url} />
              <AvatarFallback>
                {doctor.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{doctor.nome}</h3>
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Médico
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {doctor.crm && (
                  <div className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    <span>CRM: {doctor.crm}</span>
                  </div>
                )}
                {doctor.especialidade && (
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    <span>Especialidade: {doctor.especialidade}</span>
                  </div>
                )}
                {doctor.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{doctor.email}</span>
                  </div>
                )}
                {doctor.telefone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{doctor.telefone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Cadastrado em: {format(new Date(doctor.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleDeleteDoctor(doctor.id)}
              >
                <UserX className="h-4 w-4 mr-2" />
                Desativar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
        <p className="text-gray-600">Gerencie pacientes e médicos da plataforma</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                <p className="text-3xl font-bold text-hopecann-teal">{patients.length}</p>
              </div>
              <Users className="h-12 w-12 text-hopecann-teal opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Médicos</p>
                <p className="text-3xl font-bold text-green-600">{doctors.length}</p>
              </div>
              <UserCheck className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-3xl font-bold text-blue-600">{patients.length + doctors.length}</p>
              </div>
              <Activity className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, email, CRM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pacientes ({filteredPatients.length})
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Médicos ({filteredDoctors.length})
            </TabsTrigger>
          </TabsList>

          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar {activeTab === 'patients' ? 'Paciente' : 'Médico'}
          </Button>
        </div>

        <TabsContent value="patients">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">
                {patients.length === 0 ? 'Nenhum paciente cadastrado' : 'Nenhum paciente encontrado'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPatients.map(patient => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="doctors">
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">
                {doctors.length === 0 ? 'Nenhum médico cadastrado' : 'Nenhum médico encontrado'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredDoctors.map(doctor => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
