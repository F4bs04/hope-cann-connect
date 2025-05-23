
import { CalendarDays, FileText, HeartPulse } from 'lucide-react';
import { DashboardSummaryCard } from './DashboardSummaryCard';

const SUMMARY_CARDS = [
  {
    label: "Próxima Consulta",
    value: "25/04 às 14:00",
    icon: CalendarDays,
    colorClass: "bg-hopecann-teal/10",
  },
  {
    label: "Consultas Pendentes",
    value: "2",
    icon: HeartPulse,
    colorClass: "bg-hopecann-green/10",
  },
  {
    label: "Novos Documentos",
    value: "1 receita",
    icon: FileText,
    colorClass: "bg-blue-100",
  }
];

export function DashboardSummaryCards() {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Resumo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SUMMARY_CARDS.map((card) => (
          <DashboardSummaryCard
            key={card.label}
            {...card}
          />
        ))}
      </div>
    </div>
  );
}
