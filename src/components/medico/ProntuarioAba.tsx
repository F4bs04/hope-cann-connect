import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, ArrowLeft, Download, FileText } from 'lucide-react';
import { useDoctorSchedule } from '@/contexts/DoctorScheduleContext';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getPacientes, getDocumentUrl } from '@/services/supabaseService';
import { getReceitasByPaciente } from '@/services/receitas/receitasService';
import { getAtestadosByPaciente } from '@/services/documentos/atestadosService';
import { getLaudosByPaciente } from '@/services/documentos/laudosService';
import { getPedidosExameByPaciente } from '@/services/exames/examesService';
import { getProntuariosByPaciente } from '@/services/prontuarios/prontuariosService';

interface ProntuarioAbaProps {
  onBack: () => void;
}

const ProntuarioAba: React.FC<ProntuarioAbaProps> = ({ onBack }) => {
  const { toast } = useToast();
  const { selectedPaciente, setSelectedPaciente, handleSaveProntuario, historicoPaciente } = useDoctorSchedule();

  const [prontuarioData, setProntuarioData] = useState({
    condicoes_medicas: '',
    alergias: '',
    medicamentos_atuais: '',
    historico_familiar: '',
  });

  const [acompanhamentoData, setAcompanhamentoData] = useState({
    sintomas: '',
    efeitos_colaterais: '',
    eficacia: '',
    notas_adicionais: '',
  });

  const [pacienteInfo, setPacienteInfo] = useState({
    full_name: '',
    cpf: '',
    birth_date: '',
    gender: '',
    address: '',
    medical_condition: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const [documentos, setDocumentos] = useState({
    receitas: [] as any[],
    atestados: [] as any[],
    laudos: [] as any[],
    exames: [] as any[],
    prontuarios: [] as any[],
  });

  const [loadingDocs, setLoadingDocs] = useState(false);
  const [autoLoadingPaciente, setAutoLoadingPaciente] = useState(false);

  useEffect(() => {
    if (historicoPaciente) {
      setProntuarioData({
        condicoes_medicas: historicoPaciente.condicoes_medicas || '',
        alergias: historicoPaciente.alergias || '',
        medicamentos_atuais: historicoPaciente.medicamentos_atuais || '',
        historico_familiar: historicoPaciente.historico_familiar || '',
      });
    }
  }, [historicoPaciente]);

  useEffect(() => {
    const loadDefaultPaciente = async () => {
      try {
        setAutoLoadingPaciente(true);
        const { data: auth } = await supabase.auth.getUser();
        const doctorUserId = auth?.user?.id;
        if (!doctorUserId) return;

        const pacientes = await getPacientes(doctorUserId);
        if (pacientes && pacientes.length > 0) {
          const p = pacientes[0];
          const idade =
            p.birth_date ? new Date().getFullYear() - new Date(p.birth_date).getFullYear() : 0;

          setSelectedPaciente?.({
            id: p.id,
            nome: p.full_name || p.profiles?.full_name || p.emergency_contact_name || 'Paciente',
            idade,
            condicao: p.medical_condition || 'Condição não informada',
            ultimaConsulta: new Date().toISOString(),
          });

          toast({
            title: 'Paciente carregado',
            description: `Carregamos automaticamente ${p.full_name || 'o primeiro paciente'}.`,
          });
        }
      } catch (e) {
        console.error('Erro ao carregar paciente padrão:', e);
      } finally {
        setAutoLoadingPaciente(false);
      }
    };

    if (!selectedPaciente) {
      void loadDefaultPaciente();
    }
  }, [selectedPaciente, setSelectedPaciente, toast]);

  useEffect(() => {
    const fetchPacienteInfo = async (pacienteId: string) => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', pacienteId)
          .maybeSingle();

        if (error) throw error;

        setPacienteInfo({
          full_name: data?.full_name || '',
          cpf: data?.cpf || '',
          birth_date: data?.birth_date || '',
          gender: data?.gender || '',
          address: data?.address || '',
          medical_condition: data?.medical_condition || '',
          emergency_contact_name: data?.emergency_contact_name || '',
          emergency_contact_phone: data?.emergency_contact_phone || '',
        });
      } catch (e) {
        console.error('Erro ao carregar informações do paciente:', e);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do paciente.',
          variant: 'destructive',
        });
      }
    };

    const fetchDocumentos = async (pacienteId: string) => {
      setLoadingDocs(true);
      try {
        const [receitas, atestados, laudos, exames, prontuarios] = await Promise.all([
          getReceitasByPaciente(pacienteId),
          getAtestadosByPaciente(pacienteId),
          getLaudosByPaciente(pacienteId),
          getPedidosExameByPaciente(pacienteId),
          getProntuariosByPaciente(pacienteId),
        ]);

        setDocumentos({
          receitas: receitas || [],
          atestados: atestados || [],
          laudos: laudos || [],
          exames: exames || [],
          prontuarios: prontuarios || [],
        });
      } catch (e) {
        console.error('Erro ao carregar documentos:', e);
      } finally {
        setLoadingDocs(false);
      }
    };

    if (selectedPaciente?.id) {
      void fetchPacienteInfo(selectedPaciente.id);
      void fetchDocumentos(selectedPaciente.id);
    }
  }, [selectedPaciente, toast]);

  const handleSave = () => {
    if (selectedPaciente) {
      handleSaveProntuario({
        ...prontuarioData,
        id_paciente: selectedPaciente.id,
        ultima_atualizacao: new Date().toISOString(),
        acompanhamento: {
          ...acompanhamentoData,
          id_paciente: selectedPaciente.id,
          data_registro: new Date().toISOString(),
        },
      });

      toast({
        title: 'Prontuário atualizado',
        description: 'Informações salvas com sucesso.',
      });
    }
  };

  const handleDownloadDocument = async (filePath: string, fileName: string) => {
    try {
      const url = await getDocumentUrl(filePath);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível baixar o documento.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Não informado';
    return format(d, 'dd/MM/yyyy');
  };

  if (!selectedPaciente) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <h2 className="text-2xl font-bold mb-2">Dados do Paciente</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Selecione um paciente na lista ou clique no botão abaixo para carregar automaticamente.
        </p>

        <div className="mb-6">
          <Button disabled={autoLoadingPaciente} onClick={() => { /* o efeito já tenta carregar automaticamente */ }}>
            {autoLoadingPaciente ? 'Carregando...' : 'Carregar primeiro paciente'}
          </Button>
        </div>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <div className="p-3 border rounded-md bg-gray-50">Selecione um paciente para visualizar</div>
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <div className="p-3 border rounded-md bg-gray-50">Selecione um paciente para visualizar</div>
            </div>
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <div className="p-3 border rounded-md bg-gray-50">Selecione um paciente para visualizar</div>
            </div>
            <div className="space-y-2">
              <Label>Gênero</Label>
              <div className="p-3 border rounded-md bg-gray-50">Selecione um paciente para visualizar</div>
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <div className="p-3 border rounded-md bg-gray-50">Selecione um paciente para visualizar</div>
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <div className="p-3 border rounded-md bg-gray-50">Selecione um paciente para visualizar</div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Condição Médica</Label>
              <div className="p-3 border rounded-md bg-gray-50">Selecione um paciente para visualizar</div>
            </div>
            <div className="space-y-2">
              <Label>Contato de Emergência - Nome</Label>
              <div className="p-3 border rounded-md bg-gray-50">Selecione um paciente para visualizar</div>
            </div>
            <div className="space-y-2">
              <Label>Contato de Emergência - Telefone</Label>
              <div className="p-3 border rounded-md bg-gray-50">Selecione um paciente para visualizar</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>

      <h2 className="text-2xl font-bold mb-6">Prontuário de {selectedPaciente.nome}</h2>

      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Dados do Paciente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Nome Completo</Label>
            <div className="p-3 border rounded-md bg-gray-50">{pacienteInfo.full_name || 'Não informado'}</div>
          </div>
          <div className="space-y-1">
            <Label>CPF</Label>
            <div className="p-3 border rounded-md bg-gray-50">{pacienteInfo.cpf || 'Não informado'}</div>
          </div>
          <div className="space-y-1">
            <Label>Data de Nascimento</Label>
            <div className="p-3 border rounded-md bg-gray-50">{formatDate(pacienteInfo.birth_date)}</div>
          </div>
          <div className="space-y-1">
            <Label>Gênero</Label>
            <div className="p-3 border rounded-md bg-gray-50">{pacienteInfo.gender || 'Não informado'}</div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Endereço</Label>
            <div className="p-3 border rounded-md bg-gray-50">{pacienteInfo.address || 'Não informado'}</div>
          </div>
          <div className="space-y-1">
            <Label>Contato de Emergência - Nome</Label>
            <div className="p-3 border rounded-md bg-gray-50">{pacienteInfo.emergency_contact_name || 'Não informado'}</div>
          </div>
          <div className="space-y-1">
            <Label>Contato de Emergência - Telefone</Label>
            <div className="p-3 border rounded-md bg-gray-50">{pacienteInfo.emergency_contact_phone || 'Não informado'}</div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Condição Médica</Label>
            <div className="p-3 border rounded-md bg-gray-50 whitespace-pre-wrap">
              {pacienteInfo.medical_condition || 'Não informado'}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 py-4">
        <div>
          <h3 className="text-lg font-medium mb-4">Histórico Médico</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condicoes_medicas">Condições Médicas</Label>
              <Textarea
                id="condicoes_medicas"
                value={prontuarioData.condicoes_medicas}
                onChange={(e) => setProntuarioData({ ...prontuarioData, condicoes_medicas: e.target.value })}
                placeholder="Descreva as condições médicas do paciente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alergias">Alergias</Label>
              <Textarea
                id="alergias"
                value={prontuarioData.alergias}
                onChange={(e) => setProntuarioData({ ...prontuarioData, alergias: e.target.value })}
                placeholder="Liste as alergias do paciente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicamentos_atuais">Medicamentos Atuais</Label>
              <Textarea
                id="medicamentos_atuais"
                value={prontuarioData.medicamentos_atuais}
                onChange={(e) => setProntuarioData({ ...prontuarioData, medicamentos_atuais: e.target.value })}
                placeholder="Liste os medicamentos atuais do paciente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="historico_familiar">Histórico Familiar</Label>
              <Textarea
                id="historico_familiar"
                value={prontuarioData.historico_familiar}
                onChange={(e) => setProntuarioData({ ...prontuarioData, historico_familiar: e.target.value })}
                placeholder="Descreva o histórico familiar relevante"
              />
            </div>
            {historicoPaciente?.ultima_atualizacao && (
              <div className="text-sm text-gray-500">
                Última atualização: {format(new Date(historicoPaciente.ultima_atualizacao), 'dd/MM/yyyy HH:mm')}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Novo Acompanhamento</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sintomas">Sintomas</Label>
              <Textarea
                id="sintomas"
                value={acompanhamentoData.sintomas}
                onChange={(e) => setAcompanhamentoData({ ...acompanhamentoData, sintomas: e.target.value })}
                placeholder="Descreva os sintomas atuais"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="efeitos_colaterais">Efeitos Colaterais</Label>
              <Textarea
                id="efeitos_colaterais"
                value={acompanhamentoData.efeitos_colaterais}
                onChange={(e) => setAcompanhamentoData({ ...acompanhamentoData, efeitos_colaterais: e.target.value })}
                placeholder="Descreva os efeitos colaterais observados"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eficacia">Eficácia do Tratamento</Label>
              <Textarea
                id="eficacia"
                value={acompanhamentoData.eficacia}
                onChange={(e) => setAcompanhamentoData({ ...acompanhamentoData, eficacia: e.target.value })}
                placeholder="Avalie a eficácia do tratamento atual"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notas_adicionais">Notas Adicionais</Label>
              <Textarea
                id="notas_adicionais"
                value={acompanhamentoData.notas_adicionais}
                onChange={(e) => setAcompanhamentoData({ ...acompanhamentoData, notas_adicionais: e.target.value })}
                placeholder="Adicione observações e notas relevantes"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Documentos do Paciente</h3>
        {loadingDocs ? (
          <p className="text-sm text-muted-foreground">Carregando documentos...</p>
        ) : (
          <div className="space-y-3">
            {['receitas', 'atestados', 'laudos', 'exames', 'prontuarios'].every(
              (k) => (documentos as any)[k]?.length === 0
            ) && (
              <div className="text-center text-muted-foreground py-6">
                Nenhum documento encontrado para este paciente.
              </div>
            )}

            {(documentos.receitas || []).map((doc) => (
              <div key={`rec-${doc.id}`} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Receita #{doc.id}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(doc.issued_at || doc.created_at)}</div>
                  </div>
                </div>
                {doc.file_path && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadDocument(doc.file_path, `Receita-${doc.id}.pdf`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                )}
              </div>
            ))}

            {(documentos.atestados || []).map((doc) => (
              <div key={`at-${doc.id}`} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Atestado #{doc.id}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</div>
                  </div>
                </div>
                {doc.file_path && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadDocument(doc.file_path, `Atestado-${doc.id}.pdf`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                )}
              </div>
            ))}

            {(documentos.laudos || []).map((doc) => (
              <div key={`la-${doc.id}`} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Laudo #{doc.id}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</div>
                  </div>
                </div>
                {doc.file_path && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadDocument(doc.file_path, `Laudo-${doc.id}.pdf`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                )}
              </div>
            ))}

            {(documentos.exames || []).map((doc) => (
              <div key={`ex-${doc.id}`} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Pedido de Exame #{doc.id}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</div>
                  </div>
                </div>
                {doc.file_path && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadDocument(doc.file_path, `PedidoExame-${doc.id}.pdf`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                )}
              </div>
            ))}

            {(documentos.prontuarios || []).map((doc) => (
              <div key={`pr-${doc.id}`} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Prontuário #{doc.id}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</div>
                  </div>
                </div>
                {doc.file_path && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadDocument(doc.file_path, `Prontuario-${doc.id}.pdf`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end mt-8">
        <Button type="button" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Prontuário
        </Button>
      </div>
    </div>
  );
};

export default ProntuarioAba;
