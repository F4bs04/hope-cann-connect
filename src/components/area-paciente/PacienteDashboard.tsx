
import React, { useState } from 'react';
import { DashboardSummaryCards } from "./DashboardSummaryCards";
import ReceitasRecentes from "@/components/paciente/ReceitasRecentes";
import DocumentosMedicos from "./DocumentosMedicos";
import { useReceitasRecentes } from '@/hooks/useReceitasRecentes';
import { Button } from '@/components/ui/button';
import { FileText, Home } from 'lucide-react';

const PacienteDashboard = () => {
  const { receitas, documentos, isLoading } = useReceitasRecentes();
  const [activeView, setActiveView] = useState<'dashboard' | 'documentos'>('dashboard');

  if (activeView === 'documentos') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
        <DocumentosMedicos />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 mb-2">
        <DashboardSummaryCards />
        <Button 
          onClick={() => setActiveView('documentos')}
          className="flex items-center gap-2 bg-hopecann-teal hover:bg-hopecann-teal/90"
        >
          <FileText className="h-4 w-4" />
          Ver Todos os Documentos
        </Button>
      </div>
      
      <div className="mt-8">
        <ReceitasRecentes receitas={receitas} isLoading={isLoading} />
      </div>
      
      {documentos && documentos.length > 0 && (
        <div className="mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Novos Documentos Disponíveis</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Você tem {documentos.length} documento(s) médico(s) disponível(is)
                </p>
              </div>
              <Button 
                onClick={() => setActiveView('documentos')}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver Documentos
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacienteDashboard;
