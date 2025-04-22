
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Users,
  FileText,
  User,
  Stethoscope
} from "lucide-react";

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

// Dados simulados para os cards do dashboard
const DASH_DATA = [
  {
    title: "Receitas emitidas",
    value: "182",
    icon: <FileText className="w-8 h-8 text-[#9b87f5] bg-[#F1F0FB] rounded-full p-1.5" />,
    sub: "Último mês",
  },
  {
    title: "Pacientes ativos",
    value: "56",
    icon: <Users className="w-8 h-8 text-[#33C3F0] bg-[#D3E4FD] rounded-full p-1.5" />,
    sub: "Hoje",
  },
  {
    title: "Médicos na clínica",
    value: MEDICOS_CADASTRADOS.length.toString(),
    icon: <User className="w-8 h-8 text-[#6E59A5] bg-[#E5DEFF] rounded-full p-1.5" />,
    sub: "Equipe total",
  },
  {
    title: "Consultas marcadas",
    value: "29",
    icon: <Stethoscope className="w-8 h-8 text-[#0FA0CE] bg-[#F1F1F1] rounded-full p-1.5" />,
    sub: "Semana atual",
  },
];

const ClinicaDashboard: React.FC = () => {
  return (
    <div className="space-y-10 w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-4xl font-bold text-[#403E43]">Dashboard Clínica</h1>
        <span className="text-md text-[#8E9196]">Visão geral da clínica neste mês</span>
      </div>
      {/* Resumo com cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {DASH_DATA.map((item, idx) => (
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
      {/* Gráficos futuros e tabelas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultas por mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-44 flex items-center justify-center text-gray-400 font-medium text-lg">
              {/* Gráfico de consultas em breve... */}
              <span className="italic opacity-70">Gráfico de consultas em breve...</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status dos pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-44 flex items-center justify-center text-gray-400 font-medium text-lg">
              <span className="italic opacity-70">Gráfico de pacientes em breve...</span>
            </div>
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
              {MEDICOS_CADASTRADOS.map((medico) => (
                <div
                  className="flex items-center gap-4 bg-[#F1F0FB] rounded-lg p-3 border border-[#E5DEFF]"
                  key={medico.id}
                >
                  <img
                    src={medico.foto}
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
