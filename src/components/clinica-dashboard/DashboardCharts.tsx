
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { supabase } from "@/integrations/supabase/client";

export const DashboardCharts = () => {
  const [consultasData, setConsultasData] = useState<any[]>([]);
  const [saldosData, setSaldosData] = useState<any[]>([]);
  const [especialidadesData, setEspecialidadesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cores para os gráficos
  const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#1EAEDB', '#0EA5E9', '#33C3F0', '#F97316'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar dados de consultas (últimos 6 meses)
        const today = new Date();
        const lastSixMonths: { month: string; consultas: number }[] = [];
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(today.getMonth() - i);
          const monthName = date.toLocaleString('pt-BR', { month: 'short' });
          const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
          const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const { count } = await supabase
            .from('consultas')
            .select('*', { count: 'exact' })
            .gte('data_hora', firstDay.toISOString())
            .lte('data_hora', lastDay.toISOString());
          
          lastSixMonths.push({
            month: monthName,
            consultas: count || 0
          });
        }
        
        setConsultasData(lastSixMonths);
        
        // Buscar saldo total dos médicos
        const { data: saldosData } = await supabase
          .from('saldo_medicos')
          .select('medicos(nome), saldo_total')
          .order('saldo_total', { ascending: false })
          .limit(7);
        
        if (saldosData) {
          const formattedSaldosData = saldosData.map(item => ({
            nome: item.medicos?.nome || 'Médico sem nome',
            saldo: item.saldo_total
          }));
          setSaldosData(formattedSaldosData);
        }
        
        // Buscar médicos por especialidade
        const { data: medicosData } = await supabase
          .from('medicos')
          .select('especialidade');
        
        if (medicosData) {
          const especialidadesCount: Record<string, number> = {};
          medicosData.forEach(medico => {
            if (medico.especialidade) {
              especialidadesCount[medico.especialidade] = (especialidadesCount[medico.especialidade] || 0) + 1;
            }
          });
          
          const formattedEspecialidadesData = Object.entries(especialidadesCount).map(([name, value]) => ({
            name,
            value
          }));
          
          setEspecialidadesData(formattedEspecialidadesData);
        }
      } catch (error) {
        console.error('Erro ao buscar dados para os gráficos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Formatador para valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Gráfico de Consultas (Últimos 6 meses) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Consultas nos Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400">Carregando dados...</p>
            </div>
          ) : (
            <ChartContainer
              config={{
                consultas: {
                  color: "#9b87f5"
                }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={consultasData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="consultas" name="Consultas" fill="var(--color-consultas)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Especialidades dos Médicos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Médicos por Especialidade</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400">Carregando dados...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={especialidadesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {especialidadesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} médicos`, 'Quantidade']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Saldo por Médico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Saldo por Médico</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400">Carregando dados...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={saldosData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="nome" tick={false} />
                <YAxis tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Saldo']} />
                <Legend />
                <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#7E69AB" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
