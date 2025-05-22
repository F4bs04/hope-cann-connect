
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
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 mb-2">
        <DashboardSummaryCards />
      </div>
      
      <div className="mt-8">
        {userLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-hopecann-teal mr-2" />
              <span>Carregando informações do paciente...</span>
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
