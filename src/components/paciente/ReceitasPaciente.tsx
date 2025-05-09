
import React, { useState, useEffect } from 'react';
import { format, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReceitasPacienteProps {
  pacienteId: number;
}

const ReceitasPaciente: React.FC<ReceitasPacienteProps> = ({ pacienteId }) => {
  const [receitas, setReceitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (pacienteId <= 0) {
      setLoading(false);
      return;
    }
    
    const buscarReceitas = async () => {
      setLoading(true);
      try {
        // Buscando receitas reais do paciente no banco de dados
        const { data, error } = await supabase
          .from('receitas_app')
          .select('*')
          .eq('id_paciente', pacienteId) // Filter by the logged-in patient's ID
          .order('data', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setReceitas(data);
        } else {
          setReceitas([]);
        }
      } catch (error) {
        console.error("Erro ao buscar receitas:", error);
        toast({
          title: "Erro ao buscar receitas",
          description: "Não foi possível carregar suas receitas. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
        setReceitas([]);
      } finally {
        setLoading(false);
      }
    };
    
    buscarReceitas();
  }, [pacienteId, toast]);

  const getStatusBadge = (status: string, dataValidade?: string) => {
    if (dataValidade && isAfter(new Date(), new Date(dataValidade))) {
      return <Badge className="bg-amber-100 text-amber-800">Vencida</Badge>;
    }
    
    switch (status) {
      case 'ativa':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'utilizada':
        return <Badge className="bg-blue-100 text-blue-800">Utilizada</Badge>;
      case 'cancelada':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin text-hopecann-teal" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Suas Receitas</h2>
      
      {receitas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma receita encontrada</h3>
            <p className="text-gray-500">
              Você ainda não possui receitas. Após uma consulta, seu médico poderá prescrever receitas que aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {receitas.map(receita => (
            <Card key={receita.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className={`w-full md:w-2 p-0 md:p-0 ${
                    receita.status === 'ativa' ? 'bg-green-500' : 
                    receita.status === 'utilizada' ? 'bg-blue-500' : 
                    'bg-red-500'
                  }`}></div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold">{receita.medicamento}</h3>
                      </div>
                      {getStatusBadge(receita.status, receita.data_validade)}
                    </div>
                    
                    <p className="text-sm text-gray-700 mt-2">
                      {receita.posologia}
                    </p>
                    
                    {receita.observacoes && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        {receita.observacoes}
                      </p>
                    )}
                    
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Emitida em: {format(new Date(receita.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                    </div>
                    
                    {receita.data_validade && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Válida até: {format(new Date(receita.data_validade), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                        
                        {receita.data_validade && isAfter(new Date(), new Date(receita.data_validade)) && (
                          <div className="ml-2 flex items-center text-amber-600">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            <span className="text-xs">Vencida</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceitasPaciente;
