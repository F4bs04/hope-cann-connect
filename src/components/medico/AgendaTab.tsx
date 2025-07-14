
import React, { useState } from 'react';
import { useDoctorSchedule } from '@/contexts/DoctorScheduleContext';
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';
import { supabase } from '@/integrations/supabase/client';
import CalendarViews from './CalendarViews';
import AppointmentsList from './AppointmentsList';
import ConsultaView from '@/components/medico-dashboard/ConsultaView';
import ChatMedico from './ChatMedico';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSkeleton } from './LoadingStates';

interface AgendaTabProps {
  isQuickMode?: boolean;
}

const AgendaTab: React.FC<AgendaTabProps> = ({ isQuickMode = false }) => {
  const {
    viewMode,
    setViewMode,
    selectedWeekStart,
    selectedViewDay,
    setSelectedViewDay,
    prevWeek,
    nextWeek,
    prevDay,
    nextDay,
    horarioDialogOpen,
    setHorarioDialogOpen,
    handleFastAgendamento,
  } = useDoctorSchedule();
  
  const [selectedConsultaId, setSelectedConsultaId] = useState<number | null>(null);
  const [chatWithPatient, setChatWithPatient] = useState<any>(null);
  const { userInfo, loading: loadingUserInfo, error: userError } = useCurrentUserInfo();
  const [consultasMock, setConsultasMock] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchConsultas = async () => {
      if (!userInfo.medicoId || loadingUserInfo) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('consultas')
          .select(`
            id,
            data_hora,
            motivo,
            status,
            tipo_consulta,
            id_paciente,
            pacientes (id, nome, email, telefone)
          `)
          .eq('id_medico', userInfo.medicoId)
          .order('data_hora', { ascending: true });

        if (error) {
          console.error('Error fetching consultations:', error);
          return;
        }
        
        // Mapear dados para incluir informações do paciente
        const consultasWithPatients = (data || []).map(consulta => ({
          ...consulta,
          pacientes_app: {
            id: consulta.id_paciente,
            nome: consulta.pacientes?.nome || 'Paciente'
          }
        }));
        
        setConsultasMock(consultasWithPatients);
      } catch (error) {
        console.error('Error fetching consultations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultas();
  }, [userInfo.medicoId, loadingUserInfo]);

  if (loadingUserInfo || loading) {
    return <LoadingSkeleton />;
  }

  if (userError || !userInfo.medicoId) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar informações do médico. Por favor, tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  if (selectedConsultaId) {
    return (
      <ConsultaView 
        consultaId={selectedConsultaId} 
        onBack={() => setSelectedConsultaId(null)} 
      />
    );
  }
  
  if (chatWithPatient) {
    return (
      <ChatMedico
        medicoId={userInfo.medicoId}
        pacienteId={chatWithPatient.pacientes_app.id}
        pacienteNome={chatWithPatient.pacientes_app.nome}
        motivoConsulta={chatWithPatient.motivo}
        dataConsulta={chatWithPatient.data_hora}
        onBack={() => setChatWithPatient(null)}
      />
    );
  }

  // Since CalendarViews expects 'calendar' mode, let's use the viewMode directly
  const handleSetViewMode = (mode: 'week' | 'day' | 'calendar') => {
    setViewMode(mode);
  };

  return (
    <div>
      {!isQuickMode && (
        <CalendarViews
          viewMode={viewMode}
          setViewMode={handleSetViewMode}
          selectedWeekStart={selectedWeekStart}
          selectedViewDay={selectedViewDay}
          setSelectedViewDay={setSelectedViewDay}
          prevWeek={prevWeek}
          nextWeek={nextWeek}
          prevDay={prevDay}
          nextDay={nextDay}
          setHorarioDialogOpen={setHorarioDialogOpen}
          handleFastAgendamento={handleFastAgendamento}
        />
      )}
      
      <div className="mt-8">
        <AppointmentsList 
          appointments={consultasMock} 
          onChatWithPatient={setChatWithPatient}
        />
      </div>
    </div>
  );
};

export default AgendaTab;
