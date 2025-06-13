
import { CalendarDays, FileText, HeartPulse } from 'lucide-react';
import { DashboardSummaryCard } from './DashboardSummaryCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSummaryCards() {
  const { data, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-4">Resumo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="rounded-xl p-5 bg-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      label: "Próxima Consulta",
      value: data.proximaConsulta 
        ? `${data.proximaConsulta.data} às ${data.proximaConsulta.horario}`
        : "Nenhuma agendada",
      icon: CalendarDays,
      colorClass: "bg-hopecann-teal/10",
    },
    {
      label: "Consultas Pendentes",
      value: data.consultasPendentes.toString(),
      icon: HeartPulse,
      colorClass: "bg-hopecann-green/10",
    },
    {
      label: "Novos Documentos",
      value: data.novosDocumentos > 0 
        ? `${data.novosDocumentos} receita${data.novosDocumentos > 1 ? 's' : ''}`
        : "Nenhum novo",
      icon: FileText,
      colorClass: "bg-blue-100",
    }
  ];

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Resumo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <DashboardSummaryCard
            key={card.label}
            {...card}
          />
        ))}
      </div>
    </div>
  );
}
