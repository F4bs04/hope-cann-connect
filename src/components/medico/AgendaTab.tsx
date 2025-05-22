import React, { useState } from 'react';
import { useDoctorSchedule } from '@/contexts/DoctorScheduleContext';
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';
import { supabase } from '@/integrations/supabase/client';
import CalendarViews from './CalendarViews';
import AppointmentsList from './AppointmentsList';
import ConsultaView from '@/components/medico-dashboard/ConsultaView';
import ChatMedico from './ChatMedico';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AgendaTabProps {
  isQuickMode?: boolean;
}

const AgendaTab: React.FC<AgendaTabProps> = ({ isQuickMode = false }) => {
  const {
    viewMode,
    setViewMode,
    selectedWeekStart,
    currentDate,
    setCurrentDate,
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

  React.useEffect(() => {
    const fetchConsultas = async () => {
      if (!userInfo.medicoId) return;
      
      try {
        const { data, error } = await supabase
          .from('consultas')
          .select(`
            id,
            data_hora,
            motivo,
            status,
            tipo_consulta,
            pacientes_app (id, nome)
          `)
          .eq('id_medico', userInfo.medicoId);

        if (error) throw error;
        setConsultasMock(data || []);
      } catch (error) {
        console.error('Error fetching consultations:', error);
      }
    };

    if (userInfo.medicoId) {
      fetchConsultas();
    }
  }, [userInfo.medicoId]);

  if (loadingUserInfo) {
    return <div>Carregando...</div>;
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

  return (
    <div>
      {!isQuickMode && (
        <CalendarViews
          viewMode={viewMode}
          setViewMode={setViewMode}
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
