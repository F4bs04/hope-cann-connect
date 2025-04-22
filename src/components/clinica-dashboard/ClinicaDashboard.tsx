
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

// Simulação de médicos cadastrados (poderá ser substituído por dados reais depois)
const MEDICOS_CADASTRADOS = [
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
const DASH_DATA_INITIAL = [
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

const ClinicaDashboard: React.FC = () => {
  const [dashData, setDashData] = useState(DASH_DATA_INITIAL);
  const [medicos, setMedicos] = useState(MEDICOS_CADASTRADOS);
  const [saldoMedicos, setSaldoMedicos] = useState<any[]>([]);
  const [ultimasTransacoes, setUltimasTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      setLoading(true);
      try {
        // Buscar médicos
        const { data: medicosData, error: medicosError } = await supabase
          .from('medicos')
          .select('*');
        
        if (medicosError) throw medicosError;
        if (medicosData && medicosData.length > 0) {
          setMedicos(medicosData);
        }

        // Buscar saldo dos médicos
        const { data: saldoData, error: saldoError } = await supabase
          .from('saldo_medicos')
          .select('*, medicos(nome, especialidade, crm, foto_perfil)')
          .order('saldo_total', { ascending: false });
        
        if (saldoError) throw saldoError;
        setSaldoMedicos(saldoData || []);

        // Buscar últimas transações
        const { data: transacoesData, error: transacoesError } = await supabase
          .from('transacoes_medicos')
          .select('*, medicos(nome)')
          .order('data_transacao', { ascending: false })
          .limit(5);
        
        if (transacoesError) throw transacoesError;
        setUltimasTransacoes(transacoesData || []);

        // Buscar estatísticas para os cards
        const { data: receitasData } = await supabase
          .from('receitas_app')
          .select('count', { count: 'exact' })
          .gte('data', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

        const { data: pacientesData } = await supabase
          .from('pacientes_app')
          .select('count', { count: 'exact' });

        const { data: consultasData } = await supabase
          .from('consultas')
          .select('count', { count: 'exact' })
          .gte('data_hora', new Date(new Date().setDate(new Date().getDate() - 7)).toISOString());

        // Atualizar os cards com dados reais
        const newDashData = [...dashData];
        if (receitasData) newDashData[0].value = receitasData.count?.toString() || "0";
        if (pacientesData) newDashData[1].value = pacientesData.count?.toString() || "0";
        if (medicosData) newDashData[2].value = medicosData.length.toString();
        if (consultasData) newDashData[3].value = consultasData.count?.toString() || "0";
        
        setDashData(newDashData);
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
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-4xl font-bold text-[#403E43]">Dashboard Clínica</h1>
        <span className="text-md text-[#8E9196]">Visão geral da clínica neste mês</span>
      </div>
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
                                alt={saldo.medicos.nome} 
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
                    src={medico.foto_perfil || `/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png`}
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
    </div>
  );
};

export default ClinicaDashboard;
