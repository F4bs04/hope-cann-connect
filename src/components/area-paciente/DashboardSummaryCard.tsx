
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardSummaryCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  colorClass: string;
}

export function DashboardSummaryCard({ label, value, icon: Icon, colorClass }: DashboardSummaryCardProps) {
  return (
    <div className={`rounded-xl p-6 flex items-center gap-4 border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] ${colorClass} bg-card`}>
      <div className="p-3 rounded-lg bg-primary/10">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1">
        <div className="font-bold text-xl text-foreground mb-1">{value}</div>
        <div className="text-muted-foreground text-sm font-medium">{label}</div>
      </div>
    </div>
  );
}
