
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DoctorScheduleContextType } from '@/types/doctorScheduleTypes';
import { useCalendarNavigation } from '@/hooks/useCalendarNavigation';
import { useHorarios } from '@/hooks/useHorarios';
import { usePacientesData } from '@/hooks/usePacientesData';
import { useDialogState } from '@/hooks/useDialogState';
import { todosHorariosDisponiveis } from '@/mocks/doctorScheduleMockData';

const DoctorScheduleContext = createContext<DoctorScheduleContextType | undefined>(undefined);

export const DoctorScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const calendarNavigation = useCalendarNavigation();
  const horarios = useHorarios();
  const pacientesData = usePacientesData();
  const dialogState = useDialogState();

  // Initialize all horarios on first load
  useEffect(() => {
    horarios.applyPatternToWeek('all', 'all');
    toast({
      title: "Todos os horários disponibilizados",
      description: "Todos os dias da semana estão com horários completos disponíveis para consultas.",
    });
  }, []);

  // Combine all the hooks into a single context value
  const value: DoctorScheduleContextType = {
    ...calendarNavigation,
    ...horarios,
    ...pacientesData,
    ...dialogState,
  };

  return (
    <DoctorScheduleContext.Provider value={value}>
      {children}
    </DoctorScheduleContext.Provider>
  );
};

export const useDoctorSchedule = (): DoctorScheduleContextType => {
  const context = useContext(DoctorScheduleContext);
  if (context === undefined) {
    throw new Error('useDoctorSchedule must be used within a DoctorScheduleProvider');
  }
  return context;
};
