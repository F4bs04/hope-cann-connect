
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HistoricoPacienteProps {
  pacienteId: number;
}

const HistoricoPaciente: React.FC<HistoricoPacienteProps> = ({ pacienteId }) => {
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchHistorico = async () => {
      if (!pacienteId) return;
      
      try {
        // Verificar se existe histórico médico para o paciente
        const { data, error } = await supabase
          .from('historico_medico')
          .select('*')
          .eq('id_paciente', pacienteId);
        
        if (error) {
          console.error('Erro ao buscar histórico médico:', error);
        } else {
          setHistorico(data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistorico();
  }, [pacienteId]);
  
  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Seu Histórico Médico</h2>
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (historico.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Seu Histórico Médico</h2>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Histórico médico em desenvolvimento</h3>
            <p className="text-gray-500">
              Esta funcionalidade estará disponível em breve. Aqui você poderá consultar todo seu histórico médico e acompanhar a evolução do seu tratamento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Seu Histórico Médico</h2>
      
      <div className="space-y-4">
        {historico.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">Registro Médico</h3>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>Atualizado: {new Date(item.ultima_atualizacao).toLocaleDateString()}</span>
                </div>
              </div>
              
              {item.condicoes_medicas && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Condições Médicas:</h4>
                  <p className="text-sm">{item.condicoes_medicas}</p>
                </div>
              )}
              
              {item.medicamentos_atuais && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Medicamentos Atuais:</h4>
                  <p className="text-sm">{item.medicamentos_atuais}</p>
                </div>
              )}
              
              {item.alergias && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Alergias:</h4>
                  <p className="text-sm">{item.alergias}</p>
                </div>
              )}
              
              {item.historico_familiar && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Histórico Familiar:</h4>
                  <p className="text-sm">{item.historico_familiar}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HistoricoPaciente;
