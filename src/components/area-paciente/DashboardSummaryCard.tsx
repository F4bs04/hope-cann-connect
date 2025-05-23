
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
    <div className={`rounded-xl p-5 flex items-center gap-3 shadow-sm ${colorClass}`}>
      <Icon className="w-6 h-6 text-hopecann-teal" />
      <div>
        <div className="font-semibold text-lg text-gray-800">{value}</div>
        <div className="text-gray-500 text-sm">{label}</div>
      </div>
    </div>
  );
}
