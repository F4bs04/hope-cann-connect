
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ConsultasList } from './consultas/ConsultasList';

interface ConsultasPacienteProps {
  pacienteId: number;
}

const ConsultasPaciente: React.FC<ConsultasPacienteProps> = ({ pacienteId }) => {
  const { toast } = useToast();
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pacienteId <= 0) {
      setLoading(false);
      return;
    }
    
    const buscarConsultas = async () => {
      setLoading(true);
      setError(null);
      try {
        // Using a simpler query approach to avoid RLS issues
        const { data, error } = await supabase
          .from('consultas')
          .select(`
            *,
            medicos (id, nome, especialidade, foto_perfil)
          `)
          .eq('id_paciente', pacienteId);
        
        if (error) throw error;
        if (data) setConsultas(data);
      } catch (error) {
        console.error("Erro ao buscar consultas:", error);
        const errorMessage = "Não foi possível carregar suas consultas. Por favor, tente novamente mais tarde.";
        setError(errorMessage);
        toast({
          title: "Erro ao carregar consultas",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    buscarConsultas();
  }, [pacienteId, toast]);

  const handleCancelarConsulta = async (id: number) => {
    try {
      const { error } = await supabase
        .from('consultas')
        .update({ status: 'cancelada' })
        .eq('id', id);
      
      if (error) throw error;
      
      setConsultas(consultas.map(consulta => 
        consulta.id === id ? {...consulta, status: 'cancelada'} : consulta
      ));
      
      toast({
        title: "Consulta cancelada",
        description: "Sua consulta foi cancelada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao cancelar consulta:", error);
      toast({
        title: "Erro ao cancelar",
        description: "Não foi possível cancelar sua consulta. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleReagendar = (id: number) => {
    toast({
      title: "Reagendamento",
      description: "Você será redirecionado para a página de reagendamento.",
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Suas Consultas</h2>
      <ConsultasList
        consultas={consultas}
        loading={loading}
        error={error}
        onReagendar={handleReagendar}
        onCancelar={handleCancelarConsulta}
      />
    </div>
  );
};

export default ConsultasPaciente;
