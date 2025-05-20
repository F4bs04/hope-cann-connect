
import React from 'react';
import { DashboardSummaryCards } from "./DashboardSummaryCards";
import ReceitasRecentes from "@/components/paciente/ReceitasRecentes";
import { useReceitasRecentes } from '@/hooks/useReceitasRecentes';
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const PacienteDashboard = () => {
  const { receitas, isLoading } = useReceitasRecentes();
  const { userInfo, loading: userLoading } = useCurrentUserInfo();

  return (
    <div className="space-y-6">
      {/* The DashboardSummaryCards component is internally responsive (grid-cols-1 sm:grid-cols-3) */}
      {/* We can ensure its container adapts well. */}
      <div className="w-full">
        {/* The title for DashboardSummaryCards is inside its own component, we'll leave it as is */}
        <DashboardSummaryCards />
      </div>
      
      <div className="mt-6 md:mt-8">
        {userLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center p-6 sm:p-8">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-hopecann-teal mr-2" />
              <span className="text-sm sm:text-base">Carregando informações do paciente...</span>
            </CardContent>
          </Card>
        ) : (
          <ReceitasRecentes receitas={receitas} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default PacienteDashboard;
