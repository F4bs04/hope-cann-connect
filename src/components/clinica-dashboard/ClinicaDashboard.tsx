
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

const ClinicaDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-8">
        <LayoutDashboard className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Dashboard Clínica</h1>
      </div>
      {/* Espaço reservado para gráficos no futuro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultas por mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center text-gray-400">
              {/* Aqui futuramente virá um gráfico */}
              Gráfico em breve...
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pacientes ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center text-gray-400">
              {/* Outro gráfico/tabela */}
              Gráfico/tabela em breve...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicaDashboard;
