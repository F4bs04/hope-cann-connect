import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useUnifiedAuth';
import { usePatientDocuments } from '@/hooks/usePatientDocuments';

export const useReceitasRecentes = () => {
  const [receitas, setReceitas] = useState([]);
  const [atestados, setAtestados] = useState([]);
  const [prontuarios, setProntuarios] = useState([]);
  const { userProfile } = useAuth();
  const { 
    prescriptions, 
    isLoading, 
    error, 
    fetchPrescriptions, 
    fetchCertificates,
    fetchReports 
  } = usePatientDocuments();

  useEffect(() => {
    if (userProfile) {
      fetchPrescriptions();
      loadDocuments();
    }
  }, [userProfile, fetchPrescriptions]);

  const loadDocuments = async () => {
    try {
      const [certificates, reports] = await Promise.all([
        fetchCertificates(),
        fetchReports()
      ]);
      
      setAtestados(certificates);
      setProntuarios(reports);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  useEffect(() => {
    setReceitas(prescriptions as any);
  }, [prescriptions]);

  return {
    receitas,
    atestados,
    prontuarios,
    documentos: [...atestados, ...prontuarios],
    isLoading,
    error,
    refetch: () => {
      if (userProfile) {
        fetchPrescriptions();
        loadDocuments();
      }
    }
  };
};