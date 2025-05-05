
import React from 'react';
import { DashboardSummaryCards } from "./DashboardSummaryCards";
import ReceitasRecentes from "@/components/paciente/ReceitasRecentes";
import { useReceitasRecentes } from '@/hooks/useReceitasRecentes';
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';

const PacienteDashboard = () => {
  const { receitas, isLoading } = useReceitasRecentes();
  const { userInfo } = useCurrentUserInfo();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 mb-2">
        <DashboardSummaryCards />
      </div>
      
      <div className="mt-8">
        <ReceitasRecentes receitas={receitas} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default PacienteDashboard;
