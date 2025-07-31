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

// Interface para médicos do Supabase
interface MedicoSupabase {
  id: string;
  user_id: string;
  crm: string;
  cpf: string;
  specialty: string;
  biography: string | null;
  consultation_fee: number | null;
  is_available: boolean;
  is_approved: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  };
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


import { MedicosPendentesAprovacao } from "./MedicosPendentesAprovacao";
import { DashboardCharts } from "./DashboardCharts";
import { DoctorRoadmap } from "./DoctorRoadmap";

const ClinicaDashboard: React.FC = () => {
  const [dashData, setDashData] = useState<DashCardData[]>([]);
  const [medicos, setMedicos] = useState<MedicoSupabase[]>([]);
  const [saldoMedicos, setSaldoMedicos] = useState<SaldoMedico[]>([]);
  const [ultimasTransacoes, setUltimasTransacoes] = useState<TransacaoMedico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      setLoading(true);
      try {
        // Buscar médicos aprovados
        const { data: medicosData, error: medicosError } = await supabase
          .from('doctors')
          .select(`
            *,
            profiles!inner(
              full_name,
              email,
              phone,
              avatar_url
            )
          `)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (medicosError) {
          console.error('Erro ao buscar médicos:', medicosError);
        } else {
          setMedicos(medicosData || []);
        }

        // Buscar consultas para estatísticas
        const { data: consultasData, error: consultasError } = await supabase
          .from('appointments')
          .select('*')
          .order('created_at', { ascending: false });

        // Buscar pacientes
        const { data: pacientesData, error: pacientesError } = await supabase
          .from('patients')
          .select('id')
          .order('created_at', { ascending: false });

        // Buscar prescriptions (receitas)
        const { data: prescriptionsData, error: prescriptionsError } = await supabase
          .from('prescriptions')
          .select('id')
          .eq('is_active', true);

        // Calcular estatísticas
        const totalMedicos = medicosData?.length || 0;
        const totalConsultas = consultasData?.length || 0;
        const totalPacientes = pacientesData?.length || 0;
        const totalReceitas = prescriptionsData?.length || 0;

        // Consultas desta semana
        const agora = new Date();
        const inicioSemana = new Date(agora.setDate(agora.getDate() - agora.getDay()));
        const consultasSemana = consultasData?.filter(consulta => 
          new Date(consulta.created_at) >= inicioSemana
        ).length || 0;

        // Atualizar os cards com dados reais
        const newDashData: DashCardData[] = [
          {
            title: "Receitas emitidas",
            value: String(totalReceitas),
            icon: <FileText className="w-8 h-8 text-[#9b87f5] bg-[#F1F0FB] rounded-full p-1.5" />,
            sub: "Total ativo",
          },
          {
            title: "Pacientes ativos",
            value: String(totalPacientes),
            icon: <Users className="w-8 h-8 text-[#33C3F0] bg-[#D3E4FD] rounded-full p-1.5" />,
            sub: "Cadastrados",
          },
          {
            title: "Médicos na clínica",
            value: String(totalMedicos),
            icon: <User className="w-8 h-8 text-[#6E59A5] bg-[#E5DEFF] rounded-full p-1.5" />,
            sub: "Aprovados",
          },
          {
            title: "Consultas marcadas",
            value: String(consultasSemana),
            icon: <Stethoscope className="w-8 h-8 text-[#0FA0CE] bg-[#F1F1F1] rounded-full p-1.5" />,
            sub: "Esta semana",
          },
        ];

        setDashData(newDashData);

        // Buscar transações financeiras
        const { data: transacoesData, error: transacoesError } = await supabase
          .from('financial_transactions')
          .select(`
            *,
            doctors!inner(
              profiles!inner(full_name)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!transacoesError && transacoesData) {
          const transacoesMapeadas: TransacaoMedico[] = transacoesData.map(t => ({
            id: parseInt(t.id) || 0,
            id_medico: 0, // Não usado no novo schema
            valor: Number(t.amount) || 0,
            tipo: t.transaction_type || 'credit',
            descricao: t.description || '',
            data_transacao: t.created_at,
            status: 'concluida',
            medicos: {
              nome: t.doctors?.profiles?.full_name || 'Médico não identificado'
            }
          }));
          setUltimasTransacoes(transacoesMapeadas);
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
                    src={medico.profiles?.avatar_url || `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`}
                    className="h-14 w-14 rounded-full border-2 border-[#E5DEFF] object-cover shadow"
                    alt={medico.profiles?.full_name || 'Médico'}
                  />
                  <div>
                    <div className="font-medium text-md text-[#403E43]">
                      {medico.profiles?.full_name || 'Nome não informado'}
                    </div>
                    <div className="text-sm text-[#7E69AB]">{medico.specialty || 'Especialidade não informada'}</div>
                    <div className="text-xs text-gray-500">CRM: {medico.crm || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Últimas receitas emitidas */}
      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Receitas Emitidas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-gray-400">Carregando receitas...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Sistema de receitas em desenvolvimento</p>
                <p className="text-sm text-gray-400">As receitas emitidas aparecerão aqui em breve</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* DoctorRoadmap component */}
      <DoctorRoadmap />
    </div>
  );
};

export default ClinicaDashboard;
