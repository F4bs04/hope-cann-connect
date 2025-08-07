
import React, { useState, useEffect } from 'react';
import { DashboardSummaryCards } from "./DashboardSummaryCards";
import ReceitasRecentes from "@/components/paciente/ReceitasRecentes";
import DocumentosMedicos from "./DocumentosMedicos";
import { useReceitasRecentes } from '@/hooks/useReceitasRecentes';
import { usePatientDeduplication } from '@/hooks/usePatientDeduplication';
import { useAuth } from '@/hooks/useUnifiedAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Home, Users } from 'lucide-react';
import PatientUnificationDialog from '@/components/paciente/PatientUnificationDialog';

const PacienteDashboard = () => {
  const { receitas, documentos, isLoading } = useReceitasRecentes();
  const [activeView, setActiveView] = useState<'dashboard' | 'documentos'>('dashboard');
  const [showUnificationDialog, setShowUnificationDialog] = useState(false);
  const { duplicates, detectDuplicates } = usePatientDeduplication();
  const { userProfile } = useAuth();

  // Verificar automaticamente por registros não unificados
  useEffect(() => {
    if (userProfile) {
      detectDuplicates(userProfile);
    }
  }, [userProfile, detectDuplicates]);

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
      {/* Alerta de registros para unificar */}
      {duplicates.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">
                  Registros para Unificar
                </h3>
                <p className="text-sm text-blue-700">
                  Encontramos {duplicates.length} registro(s) que podem ser seus. Unifique para ver todos os seus documentos.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{duplicates.length}</Badge>
              <Button
                onClick={() => setShowUnificationDialog(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Unificar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 mb-2">
        <DashboardSummaryCards />
        <div className="flex gap-2">
          {duplicates.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => setShowUnificationDialog(true)}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Unificar Registros
              {duplicates.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {duplicates.length}
                </Badge>
              )}
            </Button>
          )}
          <Button 
            onClick={() => setActiveView('documentos')}
            className="flex items-center gap-2 bg-hopecann-teal hover:bg-hopecann-teal/90"
          >
            <FileText className="h-4 w-4" />
            Ver Todos os Documentos
          </Button>
        </div>
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

      <PatientUnificationDialog
        open={showUnificationDialog}
        onClose={() => setShowUnificationDialog(false)}
      />
    </div>
  );
};

export default PacienteDashboard;
