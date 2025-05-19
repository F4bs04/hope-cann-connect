
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
  console.log('[AgendaTab] Component rendered/re-rendered. isQuickMode:', isQuickMode);
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
    console.log('[AgendaTab] useEffect for fetchConsultas triggered. userInfo:', userInfo, 'loadingUserInfo:', loadingUserInfo);
    const fetchConsultas = async () => {
      // Get medicoId from userInfo or localStorage
      const medicoId = userInfo.medicoId || (localStorage.getItem('medicoId') ? Number(localStorage.getItem('medicoId')) : null);
      
      if (!medicoId) {
        console.warn('[AgendaTab] fetchConsultas: medicoId is missing. userInfo:', userInfo);
        return;
      }
      console.log('[AgendaTab] fetchConsultas: Fetching consultations for medicoId:', medicoId);
      
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
          .eq('id_medico', medicoId);

        if (error) {
          console.error('[AgendaTab] fetchConsultas: Error fetching consultations:', error);
          throw error;
        }
        console.log('[AgendaTab] fetchConsultas: Consultations data fetched:', data);
        setConsultasMock(data || []);
      } catch (error) {
        console.error('[AgendaTab] fetchConsultas: Catch block error:', error);
      }
    };

    if (!loadingUserInfo) {
      // Get medicoId from userInfo or localStorage
      const medicoId = userInfo.medicoId || (localStorage.getItem('medicoId') ? Number(localStorage.getItem('medicoId')) : null);
      
      if (medicoId) {
        fetchConsultas();
      } else {
        console.warn('[AgendaTab] useEffect for fetchConsultas: Not fetching because medicoId is missing and not loading. userInfo:', userInfo);
      }
    }
  }, [userInfo, loadingUserInfo]); // Depend on the whole userInfo object and loading state

  if (loadingUserInfo) {
    console.log('[AgendaTab] Rendering: Loading user info...');
    return <div>Carregando informações do médico...</div>;
  }

  if (userError) {
    console.error('[AgendaTab] Rendering: User info error:', userError);
     return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar informações do médico: {userError}. Por favor, tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Get medicoId from userInfo or localStorage
  const medicoId = userInfo.medicoId || (localStorage.getItem('medicoId') ? Number(localStorage.getItem('medicoId')) : null);
  
  if (!medicoId) {
    console.warn('[AgendaTab] Rendering: medicoId is missing. Cannot display agenda contents effectively. userInfo:', userInfo);
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Não foi possível identificar o médico. Verifique seu login e tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (selectedConsultaId) {
    console.log('[AgendaTab] Rendering: ConsultaView for consultaId:', selectedConsultaId);
    return (
      <ConsultaView 
        consultaId={selectedConsultaId} 
        onBack={() => setSelectedConsultaId(null)} 
      />
    );
  }
  
  if (chatWithPatient) {
    console.log('[AgendaTab] Rendering: ChatMedico with patient:', chatWithPatient);
    return (
      <ChatMedico
        medicoId={medicoId} // medicoId should be available here
        pacienteId={chatWithPatient.pacientes_app.id}
        pacienteNome={chatWithPatient.pacientes_app.nome}
        motivoConsulta={chatWithPatient.motivo}
        dataConsulta={chatWithPatient.data_hora}
        onBack={() => setChatWithPatient(null)}
      />
    );
  }

  console.log('[AgendaTab] Rendering: Main agenda content. ConsultasMock:', consultasMock);
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
