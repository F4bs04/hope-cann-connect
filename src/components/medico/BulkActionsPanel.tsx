
import React from 'react';
import { Button } from '@/components/ui/button';

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
    <div className="mb-6 p-4 border rounded-md bg-gray-50">
      <h3 className="text-sm font-medium mb-3">Configuração rápida</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <h4 className="text-xs font-medium mb-2">Aplicar a:</h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 text-xs"
              onClick={() => applyPatternToWeek('workdays', quickSetMode as any)}
            >
              Dias úteis
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 text-xs"
              onClick={() => applyPatternToWeek('weekend', quickSetMode as any)}
            >
              Fim de semana
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 text-xs"
              onClick={() => applyPatternToWeek('all', quickSetMode as any)}
            >
              Semana toda
            </Button>
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-medium mb-2">Definir como:</h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant={quickSetMode === 'morning' ? "default" : "outline"} 
              className="h-8 text-xs"
              onClick={() => setQuickSetMode('morning')}
            >
              Manhãs
            </Button>
            <Button 
              size="sm" 
              variant={quickSetMode === 'afternoon' ? "default" : "outline"} 
              className="h-8 text-xs"
              onClick={() => setQuickSetMode('afternoon')}
            >
              Tardes
            </Button>
            <Button 
              size="sm" 
              variant={quickSetMode === 'all' ? "default" : "outline"} 
              className="h-8 text-xs"
              onClick={() => setQuickSetMode('all')}
            >
              Dia todo
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 text-xs"
              onClick={() => applyPatternToWeek('all', 'none')}
            >
              Limpar todos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsPanel;
