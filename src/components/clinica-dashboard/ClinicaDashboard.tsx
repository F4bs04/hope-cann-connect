
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  FileText,
  User,
} from "lucide-react";

// Dados simulados para demonstração
const DASH_DATA = [
  {
    title: "Receitas emitidas",
    value: "182",
    icon: <FileText className="w-8 h-8 text-[#9b87f5] bg-[#F1F0FB] rounded-full p-1.5" />,
    sub: "Último mês",
    color: "bg-[#F1F0FB]",
  },
  {
    title: "Pacientes ativos",
    value: "56",
    icon: <Users className="w-8 h-8 text-[#33C3F0] bg-[#D3E4FD] rounded-full p-1.5" />,
    sub: "Hoje",
    color: "bg-[#D3E4FD]",
  },
  {
    title: "Médicos na clínica",
    value: "12",
    icon: <User className="w-8 h-8 text-[#6E59A5] bg-[#E5DEFF] rounded-full p-1.5" />,
    sub: "Equipe total",
    color: "bg-[#E5DEFF]",
  },
  {
    title: "Consultas marcadas",
    value: "29",
    icon: <LayoutDashboard className="w-8 h-8 text-[#0FA0CE] bg-[#F1F1F1] rounded-full p-1.5" />,
    sub: "Semana atual",
    color: "bg-[#F1F1F1]",
  },
];

const ClinicaDashboard: React.FC = () => {
  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Dashboard Clínica</h1>
      </div>
      {/* Resumo com cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {DASH_DATA.map((item, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow">
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
      {/* Espaço reservado para futuros gráficos e tabelas */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultas por mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center text-gray-400 font-medium text-lg">
              {/* Aqui futuramente virá um gráfico */}
              Gráfico de consultas em breve...
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status dos pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center text-gray-400 font-medium text-lg">
              {/* Outro gráfico/tabela */}
              Gráfico de pacientes em breve...
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Tabela resumida exemplo */}
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
