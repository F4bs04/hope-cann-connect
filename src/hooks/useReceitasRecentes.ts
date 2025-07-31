import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useUnifiedAuth';

// Hook simplificado que retorna dados mock até implementarmos as tabelas corretas
export const useReceitasRecentes = () => {
  const [receitas, setReceitas] = useState([]);
  const [atestados, setAtestados] = useState([]);
  const [prontuarios, setProntuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { userProfile } = useAuth();

  useEffect(() => {
    // Por enquanto retornamos arrays vazios
    // TODO: Implementar quando as tabelas prescriptions, documents e medical_records estiverem prontas
    if (userProfile) {
      setReceitas([]);
      setAtestados([]);
      setProntuarios([]);
      setIsLoading(false);
    }
  }, [userProfile]);

  return {
    receitas,
    atestados,
    prontuarios,
    documentos: [], // Adicionar para compatibilidade
    isLoading,
    error,
    refetch: () => {
      // Função para recarregar dados quando necessário
      setIsLoading(true);
      setTimeout(() => {
        setReceitas([]);
        setAtestados([]);
        setProntuarios([]);
        setIsLoading(false);
      }, 100);
    }
  };
};