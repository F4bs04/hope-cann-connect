import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Edit, FileText, Download, Eye, Calendar, User, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { updatePaciente } from '@/services/pacientes/pacientesService';
import { getReceitasByPaciente } from '@/services/receitas/receitasService';
import { getAtestadosByPaciente } from '@/services/documentos/atestadosService';
import { getLaudosByPaciente } from '@/services/documentos/laudosService';
import { getPedidosExameByPaciente } from '@/services/exames/examesService';
import { getProntuariosByPaciente } from '@/services/prontuarios/prontuariosService';
import { getDocumentUrl } from '@/services/documentos/documentosService';

interface PacienteDetalhesProps {
  pacienteId: string;
  onBack: () => void;
}

const PacienteDetalhes: React.FC<PacienteDetalhesProps> = ({ pacienteId, onBack }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState({
    receitas: [],
    atestados: [],
    laudos: [],
    exames: [],
    prontuarios: []
  });
  
  const [pacienteData, setPacienteData] = useState({
    full_name: '',
    cpf: '',
    birth_date: '',
    address: '',
    gender: '',
    medical_condition: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  useEffect(() => {
    loadPacienteData();
    loadDocumentos();
  }, [pacienteId]);

  const loadPacienteData = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', pacienteId)
        .single();

      if (error) throw error;
      
      if (data) {
        setPacienteData({
          full_name: data.full_name || '',
          cpf: data.cpf || '',
          birth_date: data.birth_date || '',
          address: data.address || '',
          gender: data.gender || '',
          medical_condition: data.medical_condition || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do paciente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do paciente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentos = async () => {
    try {
      const [receitas, atestados, laudos, exames, prontuarios] = await Promise.all([
        getReceitasByPaciente(pacienteId),
        getAtestadosByPaciente(pacienteId),
        getLaudosByPaciente(pacienteId),
        getPedidosExameByPaciente(pacienteId),
        getProntuariosByPaciente(pacienteId)
      ]);

      setDocumentos({
        receitas: receitas || [],
        atestados: atestados || [],
        laudos: laudos || [],
        exames: exames || [],
        prontuarios: prontuarios || []
      });
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  const handleSave = async () => {
    try {
      const result = await updatePaciente(pacienteId, pacienteData);
      
      if (result.success) {
        setIsEditing(false);
        toast({
          title: "Sucesso",
          description: "Dados do paciente atualizados com sucesso."
        });
      } else {
        throw new Error(result.error?.message || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados do paciente.",
        variant: "destructive"
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
        title: "Erro",
        description: "Não foi possível baixar o documento.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Não informado';
    try {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return `${age} anos`;
    } catch {
      return 'Idade não calculável';
    }
  };

  const renderDocumentCard = (documento: any, type: string) => {
    const getTypeIcon = () => {
      switch (type) {
        case 'receita': return '💊';
        case 'atestado': return '📋';
        case 'laudo': return '🔬';
        case 'exame': return '🩺';
        case 'prontuario': return '📄';
        default: return '📄';
      }
    };

    const getTypeName = () => {
      switch (type) {
        case 'receita': return 'Receita';
        case 'atestado': return 'Atestado';
        case 'laudo': return 'Laudo';
        case 'exame': return 'Pedido de Exame';
        case 'prontuario': return 'Prontuário';
        default: return 'Documento';
      }
    };

    return (
      <Card key={documento.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getTypeIcon()}</span>
              <div>
                <h4 className="font-medium">{documento.title || documento.medication_name || `${getTypeName()} #${documento.id}`}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(documento.created_at || documento.issued_at)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {documento.file_path && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadDocument(documento.file_path, `${getTypeName()}-${documento.id}.pdf`)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Carregando dados do paciente...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{pacienteData.full_name || 'Paciente'}</h2>
            <p className="text-sm text-muted-foreground">
              {calculateAge(pacienteData.birth_date)} • {pacienteData.gender || 'Gênero não informado'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          variant={isEditing ? "default" : "outline"}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" /> Salvar
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" /> Editar
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados Pessoais */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={pacienteData.full_name}
                    onChange={(e) => setPacienteData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                ) : (
                  <p className="mt-1 text-sm">{pacienteData.full_name || 'Não informado'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                {isEditing ? (
                  <Input
                    id="cpf"
                    value={pacienteData.cpf}
                    onChange={(e) => setPacienteData(prev => ({ ...prev, cpf: e.target.value }))}
                  />
                ) : (
                  <p className="mt-1 text-sm">{pacienteData.cpf || 'Não informado'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                {isEditing ? (
                  <Input
                    id="birth_date"
                    type="date"
                    value={pacienteData.birth_date}
                    onChange={(e) => setPacienteData(prev => ({ ...prev, birth_date: e.target.value }))}
                  />
                ) : (
                  <p className="mt-1 text-sm">{formatDate(pacienteData.birth_date)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gender">Gênero</Label>
                {isEditing ? (
                  <Input
                    id="gender"
                    value={pacienteData.gender}
                    onChange={(e) => setPacienteData(prev => ({ ...prev, gender: e.target.value }))}
                  />
                ) : (
                  <p className="mt-1 text-sm">{pacienteData.gender || 'Não informado'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="emergency_contact_phone">Telefone de Emergência</Label>
                {isEditing ? (
                  <Input
                    id="emergency_contact_phone"
                    value={pacienteData.emergency_contact_phone}
                    onChange={(e) => setPacienteData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                  />
                ) : (
                  <p className="mt-1 text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {pacienteData.emergency_contact_phone || 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={pacienteData.address}
                    onChange={(e) => setPacienteData(prev => ({ ...prev, address: e.target.value }))}
                  />
                ) : (
                  <p className="mt-1 text-sm flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    {pacienteData.address || 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="emergency_contact_name">Contato de Emergência</Label>
                {isEditing ? (
                  <Input
                    id="emergency_contact_name"
                    value={pacienteData.emergency_contact_name}
                    onChange={(e) => setPacienteData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                  />
                ) : (
                  <p className="mt-1 text-sm">{pacienteData.emergency_contact_name || 'Não informado'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="medical_condition">Condição Médica</Label>
                {isEditing ? (
                  <Textarea
                    id="medical_condition"
                    value={pacienteData.medical_condition}
                    onChange={(e) => setPacienteData(prev => ({ ...prev, medical_condition: e.target.value }))}
                  />
                ) : (
                  <p className="mt-1 text-sm">{pacienteData.medical_condition || 'Não informado'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documentos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos Médicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="todos" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="receitas">Receitas</TabsTrigger>
                  <TabsTrigger value="atestados">Atestados</TabsTrigger>
                  <TabsTrigger value="laudos">Laudos</TabsTrigger>
                  <TabsTrigger value="exames">Exames</TabsTrigger>
                  <TabsTrigger value="prontuarios">Prontuários</TabsTrigger>
                </TabsList>

                <TabsContent value="todos" className="mt-4">
                  <div className="space-y-4">
                    {documentos.receitas.map(doc => renderDocumentCard(doc, 'receita'))}
                    {documentos.atestados.map(doc => renderDocumentCard(doc, 'atestado'))}
                    {documentos.laudos.map(doc => renderDocumentCard(doc, 'laudo'))}
                    {documentos.exames.map(doc => renderDocumentCard(doc, 'exame'))}
                    {documentos.prontuarios.map(doc => renderDocumentCard(doc, 'prontuario'))}
                    {Object.values(documentos).every(arr => arr.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum documento encontrado para este paciente.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="receitas" className="mt-4">
                  {documentos.receitas.length > 0 ? (
                    documentos.receitas.map(doc => renderDocumentCard(doc, 'receita'))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma receita encontrada.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="atestados" className="mt-4">
                  {documentos.atestados.length > 0 ? (
                    documentos.atestados.map(doc => renderDocumentCard(doc, 'atestado'))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum atestado encontrado.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="laudos" className="mt-4">
                  {documentos.laudos.length > 0 ? (
                    documentos.laudos.map(doc => renderDocumentCard(doc, 'laudo'))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum laudo encontrado.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="exames" className="mt-4">
                  {documentos.exames.length > 0 ? (
                    documentos.exames.map(doc => renderDocumentCard(doc, 'exame'))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum pedido de exame encontrado.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="prontuarios" className="mt-4">
                  {documentos.prontuarios.length > 0 ? (
                    documentos.prontuarios.map(doc => renderDocumentCard(doc, 'prontuario'))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum prontuário encontrado.
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PacienteDetalhes;