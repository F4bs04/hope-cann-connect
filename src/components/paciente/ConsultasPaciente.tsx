
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

  useEffect(() => {
    if (pacienteId <= 0) {
      setLoading(false);
      return;
    }
    
    const buscarConsultas = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('consultas')
          .select(`
            *,
            medicos (id, nome, especialidade, foto_perfil)
          `)
          .eq('id_paciente', pacienteId)
          .order('data_hora', { ascending: false });
        
        if (error) throw error;
        if (data) setConsultas(data);
      } catch (error) {
        console.error("Erro ao buscar consultas:", error);
        toast({
          title: "Erro ao carregar consultas",
          description: "Não foi possível carregar suas consultas. Por favor, tente novamente mais tarde.",
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
        onReagendar={handleReagendar}
        onCancelar={handleCancelarConsulta}
      />
    </div>
  );
};

export default ConsultasPaciente;
