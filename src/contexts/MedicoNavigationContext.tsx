
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationState {
  currentSection: string;
  previousSection: string | null;
  breadcrumbs: Array<{ label: string; section: string }>;
  selectedPatientId: number | null;
  selectedConsultaId: number | null;
}

interface NavigationContextType extends NavigationState {
  navigateToSection: (section: string, params?: Record<string, string>) => void;
  goBack: () => void;
  setSelectedPatient: (patientId: number | null) => void;
  setSelectedConsulta: (consultaId: number | null) => void;
  addBreadcrumb: (label: string, section: string) => void;
  clearBreadcrumbs: () => void;
}

const MedicoNavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function MedicoNavigationProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [navigationState, setNavigationState] = useState<NavigationState>(() => {
    const params = new URLSearchParams(location.search);
    return {
      currentSection: params.get('tab') || 'dashboard',
      previousSection: null,
      breadcrumbs: [],
      selectedPatientId: params.get('paciente') ? parseInt(params.get('paciente')!) : null,
      selectedConsultaId: null
    };
  });

  const navigateToSection = useCallback((section: string, params?: Record<string, string>) => {
    setNavigationState(prev => ({
      ...prev,
      previousSection: prev.currentSection,
      currentSection: section,
      ...(params?.paciente && { selectedPatientId: parseInt(params.paciente) }),
      ...(params?.consulta && { selectedConsultaId: parseInt(params.consulta) })
    }));

    const searchParams = new URLSearchParams({ tab: section, ...params });
    navigate(`/area-medico?${searchParams.toString()}`);
  }, [navigate]);

  const goBack = useCallback(() => {
    if (navigationState.previousSection) {
      navigateToSection(navigationState.previousSection);
    } else {
      navigateToSection('dashboard');
    }
  }, [navigationState.previousSection, navigateToSection]);

  const setSelectedPatient = useCallback((patientId: number | null) => {
    setNavigationState(prev => ({
      ...prev,
      selectedPatientId: patientId
    }));
  }, []);

  const setSelectedConsulta = useCallback((consultaId: number | null) => {
    setNavigationState(prev => ({
      ...prev,
      selectedConsultaId: consultaId
    }));
  }, []);

  const addBreadcrumb = useCallback((label: string, section: string) => {
    setNavigationState(prev => ({
      ...prev,
      breadcrumbs: [...prev.breadcrumbs, { label, section }]
    }));
  }, []);

  const clearBreadcrumbs = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      breadcrumbs: []
    }));
  }, []);

  const contextValue: NavigationContextType = {
    ...navigationState,
    navigateToSection,
    goBack,
    setSelectedPatient,
    setSelectedConsulta,
    addBreadcrumb,
    clearBreadcrumbs
  };

  return (
    <MedicoNavigationContext.Provider value={contextValue}>
      {children}
    </MedicoNavigationContext.Provider>
  );
}

export function useMedicoNavigation() {
  const context = useContext(MedicoNavigationContext);
  if (context === undefined) {
    throw new Error('useMedicoNavigation must be used within a MedicoNavigationProvider');
  }
  return context;
}
