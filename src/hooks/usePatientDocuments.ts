import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useUnifiedAuth';

interface DocumentData {
  id: string;
  title: string;
  issued_at: string;
  is_signed: boolean;
  file_path?: string;
  content?: string;
  doctor_id?: string;
  patient_id: string;
}

interface PrescriptionData {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  issued_at: string;
  instructions?: string;
  notes?: string;
  doctor_id: string;
  patient_id: string;
  file_path?: string;
}

export const usePatientDocuments = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  const fetchPrescriptionsData = useCallback(async () => {
    try {
      if (!userProfile?.id) throw new Error('Usuário não autenticado');
      const userId = userProfile.id;

      // Primeiro: buscar por pacientes associados ao usuário
      const { data: directData, error: directError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient:patients!inner(id, user_id, cpf, full_name)
        `)
        .eq('patient.user_id', userId)
        .order('issued_at', { ascending: false });

      if (directError) throw directError;

      // Segundo: buscar por CPF/email em pacientes sem user_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      let indirectData: any[] = [];
      if (profile?.email) {
        const { data: indirectResult, error: indirectError } = await supabase
          .from('prescriptions')
          .select(`
            *,
            patient:patients!inner(id, user_id, cpf, full_name)
          `)
          .is('patient.user_id', null)
          .eq('patient.cpf', profile.email)
          .order('issued_at', { ascending: false });

        if (!indirectError) {
          indirectData = indirectResult || [];
        }
      }

      // Combinar resultados
      const combinedData = [...(directData || []), ...indirectData];
      
      // Remover duplicatas baseado no ID
      const uniqueData = combinedData.filter((item, index, self) => 
        index === self.findIndex(i => i.id === item.id)
      );

      return uniqueData;
    } catch (error: any) {
      console.error('Erro ao buscar prescrições:', error);
      throw error;
    }
  }, [userProfile?.id]);

  const fetchDocumentsData = useCallback(async (documentType: 'certificate' | 'exam_request' | 'medical_report' | 'prescription' | 'medical_record') => {
    try {
      if (!userProfile?.id) throw new Error('Usuário não autenticado');
      const userId = userProfile.id;

      // Primeiro: buscar por pacientes associados ao usuário
      const { data: directData, error: directError } = await supabase
        .from('documents')
        .select(`
          *,
          patient:patients!inner(id, user_id, cpf, full_name)
        `)
        .eq('patient.user_id', userId)
        .eq('document_type', documentType)
        .order('issued_at', { ascending: false });

      if (directError) throw directError;

      // Segundo: buscar por CPF/email em pacientes sem user_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      let indirectData: any[] = [];
      if (profile?.email) {
        const { data: indirectResult, error: indirectError } = await supabase
          .from('documents')
          .select(`
            *,
            patient:patients!inner(id, user_id, cpf, full_name)
          `)
          .is('patient.user_id', null)
          .eq('patient.cpf', profile.email)
          .eq('document_type', documentType)
          .order('issued_at', { ascending: false });

        if (!indirectError) {
          indirectData = indirectResult || [];
        }
      }

      // Combinar resultados
      const combinedData = [...(directData || []), ...indirectData];
      
      // Remover duplicatas baseado no ID
      const uniqueData = combinedData.filter((item, index, self) => 
        index === self.findIndex(i => i.id === item.id)
      );

      return uniqueData;
    } catch (error: any) {
      console.error(`Erro ao buscar documentos tipo ${documentType}:`, error);
      throw error;
    }
  }, [userProfile?.id]);

  const fetchPrescriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchPrescriptionsData();
      setPrescriptions(data || []);
    } catch (err: any) {
      setError(err.message);
      setPrescriptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPrescriptionsData]);

  const fetchDocumentsByType = useCallback(async (documentType: 'certificate' | 'exam_request' | 'medical_report' | 'prescription' | 'medical_record') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchDocumentsData(documentType);
      setDocuments(data || []);
      return data || [];
    } catch (err: any) {
      setError(err.message);
      setDocuments([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [fetchDocumentsData]);

  const fetchCertificates = useCallback(() => fetchDocumentsByType('certificate'), [fetchDocumentsByType]);
  const fetchExamRequests = useCallback(() => fetchDocumentsByType('exam_request'), [fetchDocumentsByType]);
  const fetchReports = useCallback(() => fetchDocumentsByType('medical_report'), [fetchDocumentsByType]);

  return {
    documents,
    prescriptions,
    isLoading,
    error,
    fetchPrescriptions,
    fetchCertificates,
    fetchExamRequests,
    fetchReports,
    fetchDocumentsByType,
    refetch: () => {
      if (userProfile) {
        fetchPrescriptions();
      }
    }
  };
};