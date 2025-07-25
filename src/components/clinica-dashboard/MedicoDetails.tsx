import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  FileText, 
  Phone, 
  Mail, 
  MapPin,
  Stethoscope,
  User,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Paciente {
  id: string;
  nome: string;
  ultima_consulta: string;
}

interface ConsultaInfo {
  total: number;
  realizadas: number;
  agendadas: number;
}

interface MedicoInfo {
  id: string;
  nome: string;
  crm: string;
  especialidade: string;
  telefone: string;
  email: string;
  biografia: string;
  foto_perfil: string | null;
  valor_por_consulta: number;
  status_disponibilidade: boolean;
}

const MedicoDetails: React.FC = () => {
  const { id: medicoId } = useParams<{ id: string }>();
  const [medico, setMedico] = useState<MedicoInfo | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [consultasInfo, setConsultasInfo] = useState<ConsultaInfo>({
    total: 0,
    realizadas: 0,
    agendadas: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (medicoId) {
      fetchMedicoDetails();
      fetchPacientes();
      fetchConsultasCount();
    }
  }, [medicoId]);

  const fetchPacientes = async () => {
    if (!medicoId) return;
    
    try {
      // Usar dados simulados por enquanto
      const pacientesSimulados: Paciente[] = [
        {
          id: '1',
          nome: 'Maria Silva',
          ultima_consulta: new Date().toISOString()
        },
        {
          id: '2', 
          nome: 'João Santos',
          ultima_consulta: new Date().toISOString()
        }
      ];
      
      setPacientes(pacientesSimulados);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConsultasCount = async () => {
    if (!medicoId) return;
    
    try {
      // Dados simulados
      setConsultasInfo({
        total: 45,
        realizadas: 42,
        agendadas: 3
      });
    } catch (error) {
      console.error('Erro ao buscar contagem de consultas:', error);
    }
  };

  const fetchMedicoDetails = async () => {
    if (!medicoId) return;
    
    try {
      // Usar dados simulados por enquanto
      const medicoSimulado: MedicoInfo = {
        id: medicoId,
        nome: 'Dr. João Silva',
        crm: '123456-SP',
        especialidade: 'Neurologia',
        telefone: '(11) 99999-9999',
        email: 'joao.silva@email.com',
        biografia: 'Especialista em neurologia com 15 anos de experiência',
        foto_perfil: '/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png',
        valor_por_consulta: 300,
        status_disponibilidade: true
      };
      
      setMedico(medicoSimulado);
    } catch (error) {
      console.error('Erro ao buscar detalhes do médico:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!medico) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Médico não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            Detalhes do Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Foto do médico */}
            <div className="flex-shrink-0">
              {medico.foto_perfil ? (
                <img 
                  src={medico.foto_perfil} 
                  alt={medico.nome}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-100">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Informações básicas */}
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{medico.nome}</h2>
                <p className="text-lg text-blue-600 font-medium">{medico.especialidade}</p>
                <p className="text-gray-600">CRM: {medico.crm}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge variant={medico.status_disponibilidade ? "default" : "secondary"}>
                  {medico.status_disponibilidade ? "Disponível" : "Indisponível"}
                </Badge>
                <span className="text-sm text-gray-600">
                  Valor consulta: R$ {medico.valor_por_consulta?.toFixed(2) || '0,00'}
                </span>
              </div>
              
              {/* Contatos */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {medico.telefone || 'Não informado'}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {medico.email || 'Não informado'}
                </div>
              </div>
              
              {/* Biografia */}
              {medico.biografia && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Biografia</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{medico.biografia}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Consultas</p>
                <p className="text-3xl font-bold text-blue-600">{consultasInfo.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultas Realizadas</p>
                <p className="text-3xl font-bold text-green-600">{consultasInfo.realizadas}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultas Agendadas</p>
                <p className="text-3xl font-bold text-orange-600">{consultasInfo.agendadas}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pacientes Atendidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pacientes Atendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pacientes.length > 0 ? (
            <div className="space-y-3">
              {pacientes.map((paciente) => (
                <div key={paciente.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{paciente.nome}</p>
                      <p className="text-sm text-gray-600">
                        Última consulta: {format(new Date(paciente.ultima_consulta), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver Histórico
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum paciente atendido ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicoDetails;