
import { CalendarDays, FileText, HeartPulse } from 'lucide-react';

interface SummaryCard {
  label: string;
  value: string;
  icon: typeof CalendarDays | typeof FileText | typeof HeartPulse;
  colorClass: string;
}

const SUMMARY_CARDS: SummaryCard[] = [
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
        {SUMMARY_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-xl p-5 flex items-center gap-3 shadow-sm ${card.colorClass}`}
            >
              <Icon className="w-6 h-6 text-hopecann-teal" />
              <div>
                <div className="font-semibold text-lg text-gray-800">
                  {card.value}
                </div>
                <div className="text-gray-500 text-sm">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
