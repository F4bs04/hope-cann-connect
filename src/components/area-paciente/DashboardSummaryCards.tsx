
import { CalendarDays, FileText, HeartPulse } from 'lucide-react';
import { DashboardSummaryCard } from './DashboardSummaryCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSummaryCards() {
  const { data, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Resumo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((index) => (
            <div key={index} className="rounded-xl p-6 bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-28" />
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
      colorClass: "bg-primary/10 border-primary/20",
    },
    {
      label: "Consultas Pendentes",
      value: data.consultasPendentes.toString(),
      icon: HeartPulse,
      colorClass: "bg-secondary/10 border-secondary/20",
    },
    {
      label: "Novos Documentos",
      value: data.novosDocumentos > 0 
        ? `${data.novosDocumentos} receita${data.novosDocumentos > 1 ? 's' : ''}`
        : "Nenhum novo",
      icon: FileText,
      colorClass: "bg-accent/10 border-accent/20",
    }
  ];

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Resumo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
