import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { ConsultasList } from './consultas/ConsultasList';
import { useToast } from '@/hooks/use-toast';

const ConsultasPaciente: React.FC = () => {
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, userProfile, isLoading: authLoading } = useUnifiedAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchConsultas = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!isAuthenticated || !userProfile?.id) {
          console.log('User not authenticated');
          setError('Usuário não autenticado');
          return;
        }

        const userId = userProfile.id;
        console.log('Fetching appointments for user:', userId);

        // First try to get patient_id from patients table
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('id, full_name, cpf')
          .eq('user_id', userId)
          .maybeSingle();

        if (patientError) {
          console.error('Error fetching patient data:', patientError);
        }

        let patientId = patientData?.id;
        
        // If no patient record found, try using user_id directly
        if (!patientId) {
          console.log('No patient record found for user_id, trying direct lookup');
          patientId = userId;
        }
        
        console.log('Using patient_id:', patientId);
        console.log('Patient data:', patientData);

        // Fetch appointments with detailed doctor information
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            *,
            doctors!inner(
              id,
              specialty,
              consultation_fee,
              profiles!inner(
                full_name,
                phone
              )
            )
          `)
          .eq('patient_id', patientId)
          .order('scheduled_at', { ascending: false });
          
        if (appointmentsError) {
          console.error('Error fetching appointments:', appointmentsError);
          throw new Error(`Erro ao buscar consultas: ${appointmentsError.message}`);
        }
        
        console.log('Appointments found:', appointmentsData?.length || 0);
        console.log('Appointments data:', appointmentsData);
        
        setConsultas(appointmentsData || []);
        
        if (!appointmentsData || appointmentsData.length === 0) {
          console.log('No appointments found for patient');
        }
        
      } catch (err: any) {
        console.error('Error in fetchConsultas:', err);
        const errorMessage = err.message || 'Erro desconhecido ao carregar consultas';
        setError(errorMessage);
        setConsultas([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading && isAuthenticated) {
      fetchConsultas();
    }
  }, [isAuthenticated, userProfile, authLoading]);

  const handleReagendar = async (appointmentId: string) => {
    toast({
      title: "Reagendamento",
      description: "Funcionalidade de reagendamento será implementada em breve.",
    });
  };

  const handleCancelar = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      setConsultas(prev => 
        prev.map(consulta => 
          consulta.id === appointmentId 
            ? { ...consulta, status: 'cancelled' }
            : consulta
        )
      );

      toast({
        title: "Consulta cancelada",
        description: "A consulta foi cancelada com sucesso.",
      });
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a consulta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Minhas Consultas</h2>
      <ConsultasList
        consultas={consultas}
        loading={loading}
        error={error}
        onReagendar={handleReagendar}
        onCancelar={handleCancelar}
      />
    </div>
  );
};

export default ConsultasPaciente;