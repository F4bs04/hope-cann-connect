
import React from 'react';
import { Button } from '@/components/ui/button';
import { SunMedium, Sunset, CalendarCheck, XCircle } from 'lucide-react';

interface BulkActionsPanelProps {
  quickSetMode: 'morning' | 'afternoon' | 'all' | 'custom';
  setQuickSetMode: (mode: 'morning' | 'afternoon' | 'all' | 'custom') => void;
  applyPatternToWeek: (pattern: 'workdays' | 'weekend' | 'all' | 'none', timePattern: 'morning' | 'afternoon' | 'all' | 'none') => void;
}

const BulkActionsPanel: React.FC<BulkActionsPanelProps> = ({
  quickSetMode,
  setQuickSetMode,
  applyPatternToWeek
}) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
      <h3 className="text-sm font-medium text-blue-700 mb-3">Configuração Rápida</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-blue-700 mb-2">Aplicar a:</p>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => applyPatternToWeek('workdays', quickSetMode === 'custom' ? 'all' : quickSetMode)}
            >
              Dias úteis
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => applyPatternToWeek('weekend', quickSetMode === 'custom' ? 'all' : quickSetMode)}
            >
              Fim de semana
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => applyPatternToWeek('all', quickSetMode === 'custom' ? 'all' : quickSetMode)}
            >
              Semana toda
            </Button>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-blue-700 mb-2">Definir como:</p>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={quickSetMode === 'morning' ? "default" : "outline"} 
              size="sm" 
              className={`h-8 text-xs flex items-center gap-1 ${quickSetMode === 'morning' ? 'bg-blue-600' : ''}`}
              onClick={() => setQuickSetMode('morning')}
            >
              <SunMedium className="h-3 w-3" />
              Manhãs
            </Button>
            <Button 
              variant={quickSetMode === 'afternoon' ? "default" : "outline"} 
              size="sm" 
              className={`h-8 text-xs flex items-center gap-1 ${quickSetMode === 'afternoon' ? 'bg-orange-500' : ''}`}
              onClick={() => setQuickSetMode('afternoon')}
            >
              <Sunset className="h-3 w-3" />
              Tardes
            </Button>
            <Button 
              variant={quickSetMode === 'all' ? "default" : "outline"} 
              size="sm" 
              className={`h-8 text-xs flex items-center gap-1 ${quickSetMode === 'all' ? 'bg-green-600' : ''}`}
              onClick={() => setQuickSetMode('all')}
            >
              <CalendarCheck className="h-3 w-3" />
              Dia todo
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => applyPatternToWeek('all', 'none')}
            >
              <XCircle className="h-3 w-3" />
              Limpar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsPanel;
