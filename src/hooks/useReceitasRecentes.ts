import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Receita {
  id: number;
  medicamento: string;
  data: string;
  status: string;
  posologia: string;
  observacoes?: string;
  arquivo_pdf?: string;
  data_validade?: string;
}

interface DocumentoMedico {
  id: number;
  tipo: 'receita' | 'atestado' | 'prontuario' | 'prescricao';
  titulo: string;
  data: string;
  status: string;
  arquivo_pdf?: string;
  medico_nome?: string;
  observacoes?: string;
}

export const useReceitasRecentes = () => {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoMedico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDocumentos = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Buscar paciente pelo user_id
        const { data: pacienteData, error: pacienteError } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (pacienteError) {
          console.log('Paciente não encontrado na tabela patients, tentando profiles...');
          
          // Fallback: buscar documentos usando o profile ID diretamente
          await fetchDocumentsByProfileId(user.id);
          return;
        }

        const pacienteId = pacienteData.id;
        await fetchDocumentsByPatientId(pacienteId);

      } catch (err: any) {
        console.error('Erro ao buscar documentos:', err);
        setError(err.message || 'Erro ao carregar documentos');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDocumentsByPatientId = async (pacienteId: number) => {
      const documentosEncontrados: DocumentoMedico[] = [];
      const receitasEncontradas: Receita[] = [];

      // Buscar receitas
      const { data: receitasData, error: receitasError } = await supabase
        .from('receitas')
        .select(`
          id,
          medicamento,
          posologia,
          observacoes,
          data_validade,
          status,
          arquivo_pdf,
          created_at,
          doctors!inner(user_id, profiles!inner(full_name))
        `)
        .eq('id_paciente', pacienteId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!receitasError && receitasData) {
        receitasData.forEach((receita: any) => {
          receitasEncontradas.push({
            id: receita.id,
            medicamento: receita.medicamento,
            data: receita.created_at,
            status: receita.status || 'ativa',
            posologia: receita.posologia,
            observacoes: receita.observacoes,
            arquivo_pdf: receita.arquivo_pdf,
            data_validade: receita.data_validade
          });

          documentosEncontrados.push({
            id: receita.id,
            tipo: 'receita',
            titulo: receita.medicamento,
            data: receita.created_at,
            status: receita.status || 'ativa',
            arquivo_pdf: receita.arquivo_pdf,
            medico_nome: receita.doctors?.profiles?.full_name || 'Médico',
            observacoes: receita.observacoes
          });
        });
      }

      // Buscar atestados
      const { data: atestadosData, error: atestadosError } = await supabase
        .from('atestados')
        .select(`
          id,
          justificativa,
          tempo_afastamento,
          unidade_tempo,
          arquivo_pdf,
          data_emissao,
          assinado,
          doctors!inner(user_id, profiles!inner(full_name))
        `)
        .eq('id_paciente', pacienteId)
        .order('data_emissao', { ascending: false })
        .limit(10);

      if (!atestadosError && atestadosData) {
        atestadosData.forEach((atestado: any) => {
          documentosEncontrados.push({
            id: atestado.id,
            tipo: 'atestado',
            titulo: `Atestado - ${atestado.tempo_afastamento} ${atestado.unidade_tempo}`,
            data: atestado.data_emissao,
            status: atestado.assinado ? 'assinado' : 'pendente',
            arquivo_pdf: atestado.arquivo_pdf,
            medico_nome: atestado.doctors?.profiles?.full_name || 'Médico',
            observacoes: atestado.justificativa
          });
        });
      }

      // Buscar prontuários
      const { data: prontuariosData, error: prontuariosError } = await supabase
        .from('prontuarios')
        .select(`
          id,
          diagnostico,
          tratamento,
          observacoes,
          data_consulta,
          status,
          doctors!inner(user_id, profiles!inner(full_name))
        `)
        .eq('id_paciente', pacienteId)
        .order('data_consulta', { ascending: false })
        .limit(10);

      if (!prontuariosError && prontuariosData) {
        prontuariosData.forEach((prontuario: any) => {
          documentosEncontrados.push({
            id: prontuario.id,
            tipo: 'prontuario',
            titulo: `Prontuário - ${prontuario.diagnostico}`,
            data: prontuario.data_consulta,
            status: prontuario.status || 'concluído',
            medico_nome: prontuario.doctors?.profiles?.full_name || 'Médico',
            observacoes: prontuario.observacoes
          });
        });
      }

      setReceitas(receitasEncontradas);
      setDocumentos(documentosEncontrados.sort((a, b) => 
        new Date(b.data).getTime() - new Date(a.data).getTime()
      ));
    };

    const fetchDocumentsByProfileId = async (profileId: string) => {
      // Implementação de fallback usando profile ID diretamente
      console.log('Implementando busca por profile ID:', profileId);
      
      // Por enquanto, retornar vazio até implementarmos o fallback completo
      setReceitas([]);
      setDocumentos([]);
    };

    fetchDocumentos();
  }, [user?.id]);

  return { 
    receitas,
    documentos,
    isLoading,
    error,
    refetch: () => {
      if (user?.id) {
        setIsLoading(true);
        // Re-trigger useEffect
        setReceitas([]);
        setDocumentos([]);
      }
    }
  };
};