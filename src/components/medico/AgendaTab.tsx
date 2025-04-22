
import React, { useState } from 'react';
import { useDoctorSchedule } from '@/contexts/DoctorScheduleContext';
import CalendarViews from './CalendarViews';
import AppointmentsList from './AppointmentsList';
import ConsultaView from '@/components/medico-dashboard/ConsultaView';
import ChatMedico from './ChatMedico';

const AgendaTab: React.FC = () => {
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
  const medicoId = 1; // Em um caso real, seria obtido da autenticação
  
  // Criar alguns dados de exemplo de consultas
  const consultasMock = [
    {
      id: 1,
      data_hora: '2025-04-26T14:00:00',
      motivo: 'Consulta de rotina',
      status: 'agendada' as const,
      tipo_consulta: 'Primeira Consulta',
      pacientes_app: { id: 1, nome: 'Maria Silva' }
    },
    {
      id: 2,
      data_hora: '2025-04-24T10:00:00',
      motivo: 'Dores na coluna',
      status: 'realizada' as const,
      tipo_consulta: 'Retorno',
      pacientes_app: { id: 2, nome: 'João Santos' }
    },
    {
      id: 3,
      data_hora: '2025-04-23T16:30:00',
      motivo: 'Avaliação de exames',
      status: 'cancelada' as const,
      tipo_consulta: 'Retorno',
      pacientes_app: { id: 3, nome: 'Ana Oliveira' }
    }
  ];

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
        medicoId={medicoId}
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
      <CalendarViews
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedWeekStart={selectedWeekStart}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        selectedViewDay={selectedViewDay}
        setSelectedViewDay={setSelectedViewDay}
        prevWeek={prevWeek}
        nextWeek={nextWeek}
        prevDay={prevDay}
        nextDay={nextDay}
        setHorarioDialogOpen={setHorarioDialogOpen}
        handleFastAgendamento={handleFastAgendamento}
      />
      
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
