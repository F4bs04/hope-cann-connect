import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Users,
  FileText,
  User,
  Stethoscope,
  Coins,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getSaldoMedicos, getTransacoesMedicos } from "@/services/supabaseService";

// Tipos para médicos
interface MedicoBase {
  id: number;
  nome: string;
  especialidade: string;
  crm: string;
}

// Tipo para médicos locais (usados inicialmente)
interface MedicoLocal extends MedicoBase {
  foto: string;
}

// Tipo para médicos do Supabase
interface MedicoSupabase extends MedicoBase {
  foto_perfil: string | null;
  biografia: string | null;
  cpf: string;
  id_clinica: number | null;
  id_usuario: number | null;
  status_disponibilidade: boolean | null;
  telefone: string;
  valor_por_consulta: number | null;
}

// Tipo para o saldo dos médicos
interface SaldoMedico {
  id: number;
  id_medico: number;
  saldo_total: number;
  ultima_atualizacao: string;
  medicos?: {
    nome?: string;
    crm?: string;
    especialidade?: string;
    foto_perfil?: string | null;
  };
}

// Tipo para transações - atualizando o tipo para aceitar string no tipo de transação
interface TransacaoMedico {
  id: number;
  id_medico: number;
  id_consulta?: number | null;
  tipo: string; // Alterado de 'credito' | 'debito' para string para compatibilidade
  valor: number;
  data_transacao: string;
  descricao: string;
  status: string;
  medicos?: {
    nome?: string;
  };
}

// Tipo para card de dashboard
interface DashCardData {
  title: string;
  value: string;
  icon: React.ReactNode;
  sub: string;
}

// Simulação de médicos cadastrados (poderá ser substituído por dados reais depois)
const MEDICOS_CADASTRADOS: MedicoLocal[] = [
  {
    id: 1,
    nome: "Dr. Ricardo Silva",
    especialidade: "Neurologista",
    crm: "12345-SP",
    foto: "/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png"
  },
  {
    id: 2,
    nome: "Dra. Ana Santos",
    especialidade: "Psiquiatra",
    crm: "54321-RJ",
    foto: "/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png"
  },
  {
    id: 3,
    nome: "Dr. Carlos Mendes",
    especialidade: "Neurologista",
    crm: "67890-MG",
    foto: "/lovable-uploads/8e0e4c0d-f012-449c-9784-9be7170458f5.png"
  },
];

// Dados simulados para os cards do dashboard que serão substituídos por dados reais
const DASH_DATA_INITIAL: DashCardData[] = [
  {
    title: "Receitas emitidas",
    value: "0",
    icon: <FileText className="w-8 h-8 text-[#9b87f5] bg-[#F1F0FB] rounded-full p-1.5" />,
    sub: "Último mês",
  },
  {
    title: "Pacientes ativos",
    value: "0",
    icon: <Users className="w-8 h-8 text-[#33C3F0] bg-[#D3E4FD] rounded-full p-1.5" />,
    sub: "Hoje",
  },
  {
    title: "Médicos na clínica",
    value: "0",
    icon: <User className="w-8 h-8 text-[#6E59A5] bg-[#E5DEFF] rounded-full p-1.5" />,
    sub: "Equipe total",
  },
  {
    title: "Consultas marcadas",
    value: "0",
    icon: <Stethoscope className="w-8 h-8 text-[#0FA0CE] bg-[#F1F1F1] rounded-full p-1.5" />,
    sub: "Semana atual",
  },
];

import MedicosPendentesAprovacao from "./MedicosPendentesAprovacao";
import { DashboardCharts } from "./DashboardCharts";
import { DoctorRoadmap } from "./DoctorRoadmap";

const ClinicaDashboard: React.FC = () => {
  const [dashData, setDashData] = useState<DashCardData[]>(DASH_DATA_INITIAL);
  const [medicos, setMedicos] = useState<MedicoLocal[]>([]);
  const [saldoMedicos, setSaldoMedicos] = useState<SaldoMedico[]>([]);
  const [ultimasTransacoes, setUltimasTransacoes] = useState<TransacaoMedico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      setLoading(true);
      try {
        const clinicaEmail = localStorage.getItem('userEmail');
        if (!clinicaEmail) {
          setLoading(false);
          return;
        }

        // Buscar dados da clínica
        const { data: clinicaData, error: clinicaError } = await supabase
          .from('clinicas')
          .select('id')
          .eq('email', clinicaEmail)
          .single();

        if (clinicaError) throw clinicaError;

        if (clinicaData) {
          // Buscar médicos da clínica
          const { data: medicosData, error: medicosError } = await supabase
            .from('medicos')
            .select('*')
            .eq('id_clinica', clinicaData.id);

          if (medicosError) throw medicosError;

          if (medicosData) {
            const medicosFormatados = medicosData.map(medico => ({
              id: medico.id,
              nome: medico.nome,
              especialidade: medico.especialidade,
              crm: medico.crm,
              foto: medico.foto_perfil || "/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png"
            }));
            setMedicos(medicosFormatados);

            // Atualizar os cards com dados reais
            const newDashData = [...DASH_DATA_INITIAL];
            newDashData[0].value = String(medicosData.length); // Total de médicos
            
            // Buscar total de consultas da clínica
            const { count: consultasCount } = await supabase
              .from('consultas')
              .select('*', { count: 'exact' })
              .eq('id_clinica', clinicaData.id);

            newDashData[1].value = String(consultasCount || 0);

            // Buscar pacientes atendidos
            const { count: pacientesCount } = await supabase
              .from('pacientes')
              .select('*', { count: 'exact' });

            newDashData[2].value = String(pacientesCount || 0);

            setDashData(newDashData);

            // Buscar saldo dos médicos
            const saldoData = await getSaldoMedicos();
            setSaldoMedicos(saldoData || []);

            // Buscar últimas transações
            const transacoesData = await getTransacoesMedicos();
            setUltimasTransacoes(transacoesData || []);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-10 w-full max-w-6xl mx-auto">
      {/* Bloco de médicos pendentes de aprovação */}
      <MedicosPendentesAprovacao />
      
      {/* Resumo com cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {dashData.map((item, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-all border-2 border-[#F1F0FB]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-medium">{item.title}</CardTitle>
                <div className="text-2xl font-bold mt-2">{item.value}</div>
                <span className="text-xs text-muted-foreground">{item.sub}</span>
              </div>
              <div className="ml-4 flex-shrink-0">{item.icon}</div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Adicionar os gráficos do dashboard */}
      <DashboardCharts />

      {/* Saldo dos médicos */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="w-5 h-5 mr-2 text-[#00B3B0]" />
              Saldo dos Médicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-gray-400">Carregando dados...</p>
              </div>
            ) : saldoMedicos.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Médico</TableHead>
                      <TableHead>CRM</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead className="text-right">Saldo Atual</TableHead>
                      <TableHead className="text-right">Última Atualização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saldoMedicos.map((saldo) => (
                      <TableRow key={saldo.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {saldo.medicos?.foto_perfil ? (
                              <img 
                                src={saldo.medicos.foto_perfil} 
                                alt={saldo.medicos.nome || 'Médico'} 
                                className="h-8 w-8 rounded-full mr-2 object-cover"
                              />
                            ) : (
                              <User className="h-8 w-8 p-1.5 rounded-full bg-gray-100 mr-2" />
                            )}
                            {saldo.medicos?.nome || `Médico #${saldo.id_medico}`}
                          </div>
                        </TableCell>
                        <TableCell>{saldo.medicos?.crm || "N/A"}</TableCell>
                        <TableCell>{saldo.medicos?.especialidade || "N/A"}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(saldo.saldo_total)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {format(new Date(saldo.ultima_atualizacao), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center flex-col gap-2">
                <p className="text-gray-400">Nenhum saldo registrado para médicos.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Últimas transações */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="w-5 h-5 mr-2 text-[#00B3B0]" />
              Últimas Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-gray-400">Carregando dados...</p>
              </div>
            ) : ultimasTransacoes.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ultimasTransacoes.map((transacao) => (
                      <TableRow key={transacao.id}>
                        <TableCell>
                          {format(new Date(transacao.data_transacao), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {transacao.medicos?.nome || `Médico #${transacao.id_medico}`}
                        </TableCell>
                        <TableCell>{transacao.descricao}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {transacao.tipo === "credito" ? (
                              <div className="flex items-center">
                                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-green-500">Crédito</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                                <span className="text-red-500">Débito</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          transacao.tipo === "credito" ? "text-green-500" : "text-red-500"
                        }`}>
                          {formatCurrency(transacao.valor)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center flex-col gap-2">
                <p className="text-gray-400">Nenhuma transação registrada.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Lista de Médicos cadastrados */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-[#7E69AB]" />
              Médicos cadastrados na clínica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {medicos.map((medico) => (
                <div
                  className="flex items-center gap-4 bg-[#F1F0FB] rounded-lg p-3 border border-[#E5DEFF]"
                  key={medico.id}
                >
                  <img
                    src={medico.foto || `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`}
                    className="h-14 w-14 rounded-full border-2 border-[#E5DEFF] object-cover shadow"
                    alt={medico.nome}
                  />
                  <div>
                    <div className="font-medium text-md text-[#403E43]">{medico.nome}</div>
                    <div className="text-sm text-[#7E69AB]">{medico.especialidade}</div>
                    <div className="text-xs text-gray-500">CRM: {medico.crm}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabela resumida de receitas */}
      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Receitas Emitidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F1F1F1]">
                  <tr>
                    <th className="p-2 text-left">Paciente</th>
                    <th className="p-2 text-left">Medicamento</th>
                    <th className="p-2 text-left">Prescritor</th>
                    <th className="p-2 text-left">Data</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">Maria Souza</td>
                    <td className="p-2">CBD 5%</td>
                    <td className="p-2">Dra. Paula Menezes</td>
                    <td className="p-2">20/04/2025</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Fernando Lima</td>
                    <td className="p-2">CBD:THC 20:1</td>
                    <td className="p-2">Dr. Carlos Silva</td>
                    <td className="p-2">19/04/2025</td>
                  </tr>
                  <tr>
                    <td className="p-2">Alice Moraes</td>
                    <td className="p-2">CBD 3%</td>
                    <td className="p-2">Dr. Júlio Viana</td>
                    <td className="p-2">18/04/2025</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* DoctorRoadmap component */}
      <DoctorRoadmap />
    </div>
  );
};

export default ClinicaDashboard;
