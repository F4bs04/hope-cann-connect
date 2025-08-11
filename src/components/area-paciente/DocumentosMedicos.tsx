import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Search, 
  Calendar, 
  User, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useReceitasRecentes } from '@/hooks/useReceitasRecentes';
import { downloadDocument } from '@/services/documentos/documentosService';

const DocumentosMedicos: React.FC = () => {
  const { toast } = useToast();
  const { receitas, documentos, isLoading, error, refetch } = useReceitasRecentes();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('todos');

  const handleDownloadPDF = async (documento: any) => {
    try {
      if (!documento.arquivo_pdf) {
        // Se não há PDF anexado, gerar PDF automaticamente
        await generateDocumentPDF(documento);
        return;
      }

      // Download do PDF anexado
      const fileName = `${documento.tipo}_${documento.titulo.replace(/\s+/g, '_')}_${documento.id}.pdf`;
      const success = await downloadDocument(documento.arquivo_pdf, fileName);

      if (success) {
        toast({
          title: "Download concluído",
          description: `O PDF do ${documento.tipo} foi baixado com sucesso.`,
        });
      } else {
        throw new Error('Falha no download do arquivo');
      }
    } catch (error: any) {
      console.error('Erro ao baixar PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro no download",
        description: error.message || "Não foi possível baixar o PDF do documento.",
      });
    }
  };

  const generateDocumentPDF = async (documento: any) => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      let documentHTML = '';
      
      switch (documento.tipo) {
        case 'receita':
          documentHTML = generateReceitaHTML(documento);
          break;
        case 'atestado':
          documentHTML = generateAtestadoHTML(documento);
          break;
        case 'prontuario':
          documentHTML = generateProntuarioHTML(documento);
          break;
        default:
          documentHTML = generateGenericHTML(documento);
      }
      
      // Criar elemento temporário
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = documentHTML;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      
      // Configurações do PDF
      const options = {
        margin: 1,
        filename: `${documento.tipo}_${documento.titulo.replace(/\s+/g, '_')}_${documento.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      // Gerar e baixar PDF
      await html2pdf().set(options).from(tempDiv).save();
      
      // Limpar elemento temporário
      document.body.removeChild(tempDiv);
      
      toast({
        title: "PDF gerado",
        description: `O ${documento.tipo} foi gerado e baixado como PDF.`,
      });
      
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro na geração do PDF",
        description: `Não foi possível gerar o PDF do ${documento.tipo}.`,
      });
    }
  };

  const esc = (val: any) => String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const slugify = (val: any) => String(val ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const generateReceitaHTML = (documento: any) => `
    <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
        <div style="display:flex;align-items:center;gap:12px;justify-content:center;margin-bottom:8px;">
          <img src="/lovable-uploads/Logo.png" alt="Hopecann - Logo" style="height:32px;"/>
          <h1 style="color: #2563eb; margin: 0; font-size: 24px;">RECEITA MÉDICA</h1>
        </div>
        <p style="color: #666; margin: 0;">Doc. Nº ${String(documento.id).padStart(4, '0')}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="margin: 10px 0;"><strong>Data de Emissão:</strong> ${esc(format(new Date(documento.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }))}</p>
        <p style="margin: 10px 0;"><strong>Médico:</strong> ${esc(documento.medico_nome)}</p>
      </div>
      
      <div style="margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <h3 style="color: #2563eb; margin-top: 0;">Medicamento Prescrito</h3>
        <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">${esc(documento.titulo)}</p>
        ${documento.observacoes ? `<p style="margin: 10px 0;"><strong>Observações:</strong> ${esc(documento.observacoes)}</p>` : ''}
      </div>
      
      <div style="margin-top: 60px; text-align: center; border-top: 1px solid #000; padding-top: 20px;">
        <div style="width: 300px; margin: 0 auto;">
          <p style="font-weight: bold; margin: 0;">Assinatura: DR-${slugify(documento.medico_nome)}-${String(documento.id).toString().padStart(4, '0')} • ${esc(documento.medico_nome)}</p>
        </div>
      </div>
    </div>
  `;

  const generateAtestadoHTML = (documento: any) => `
    <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
        <div style="display:flex;align-items:center;gap:12px;justify-content:center;margin-bottom:8px;">
          <img src="/lovable-uploads/Logo.png" alt="Hopecann - Logo" style="height:32px;"/>
          <h1 style="color: #2563eb; margin: 0; font-size: 24px;">ATESTADO MÉDICO</h1>
        </div>
        <p style="color: #666; margin: 0;">Doc. Nº ${String(documento.id).padStart(4, '0')}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="margin: 10px 0;"><strong>Data:</strong> ${esc(format(new Date(documento.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }))}</p>
        <p style="margin: 10px 0;"><strong>Médico:</strong> ${esc(documento.medico_nome)}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="margin: 15px 0; line-height: 1.6;">
          Atesto para os devidos fins que o(a) paciente deverá permanecer afastado(a) 
          de suas atividades habituais conforme especificado no documento.
        </p>
        ${documento.observacoes ? `<p style="margin: 15px 0;"><strong>Justificativa:</strong> ${esc(documento.observacoes)}</p>` : ''}
      </div>
      
      <div style="margin-top: 60px; text-align: center; border-top: 1px solid #000; padding-top: 20px;">
        <div style="width: 300px; margin: 0 auto;">
          <p style="font-weight: bold; margin: 0;">Assinatura e Carimbo do Médico</p>
          <p style="margin: 10px 0 0 0; font-size: 14px;">CRM: 12345 - RJ</p>
        </div>
      </div>
    </div>
  `;

  const generateProntuarioHTML = (documento: any) => `
    <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0; font-size: 24px;">PRONTUÁRIO MÉDICO</h1>
        <p style="color: #666; margin: 5px 0 0 0;">Doc. Nº ${String(documento.id).padStart(4, '0')}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="margin: 10px 0;"><strong>Data da Consulta:</strong> ${esc(format(new Date(documento.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }))}</p>
        <p style="margin: 10px 0;"><strong>Médico:</strong> ${esc(documento.medico_nome)}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #2563eb; margin-bottom: 15px;">${esc(documento.titulo)}</h3>
        ${documento.observacoes ? `<p style="margin: 15px 0; line-height: 1.6;">${esc(documento.observacoes)}</p>` : ''}
      </div>
      
      <div style="margin-top: 60px; text-align: center; border-top: 1px solid #000; padding-top: 20px;">
        <div style="width: 300px; margin: 0 auto;">
          <p style="font-weight: bold; margin: 0;">Assinatura e Carimbo do Médico</p>
          <p style="margin: 10px 0 0 0; font-size: 14px;">CRM: 12345 - RJ</p>
        </div>
      </div>
    </div>
  `;

  const generateGenericHTML = (documento: any) => `
    <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0; font-size: 24px;">DOCUMENTO MÉDICO</h1>
        <p style="color: #666; margin: 5px 0 0 0;">Doc. Nº ${String(documento.id).padStart(4, '0')}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="margin: 10px 0;"><strong>Data:</strong> ${esc(format(new Date(documento.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }))}</p>
        <p style="margin: 10px 0;"><strong>Médico:</strong> ${esc(documento.medico_nome)}</p>
        <p style="margin: 10px 0;"><strong>Tipo:</strong> ${esc(documento.tipo.charAt(0).toUpperCase() + documento.tipo.slice(1))}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #2563eb; margin-bottom: 15px;">${esc(documento.titulo)}</h3>
        ${documento.observacoes ? `<p style="margin: 15px 0; line-height: 1.6;">${esc(documento.observacoes)}</p>` : ''}
      </div>
      
      <div style="margin-top: 60px; text-align: center; border-top: 1px solid #000; padding-top: 20px;">
        <div style="width: 300px; margin: 0 auto;">
          <p style="font-weight: bold; margin: 0;">Assinatura e Carimbo do Médico</p>
          <p style="margin: 10px 0 0 0; font-size: 14px;">CRM: 12345 - RJ</p>
        </div>
      </div>
    </div>
  `;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativa':
      case 'assinado':
      case 'concluído':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'expirada':
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'receita':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'atestado':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'prontuario':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredDocumentos = documentos.filter(doc => {
    const matchesSearch = doc.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.medico_nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.observacoes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'todos') return matchesSearch;
    return matchesSearch && doc.tipo === activeTab;
  });

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar documentos</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos Médicos</h1>
          <p className="text-gray-600">Visualize e baixe seus documentos médicos</p>
        </div>
        <Button onClick={refetch} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Meus Documentos
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="receita">Receitas</TabsTrigger>
              <TabsTrigger value="atestado">Atestados</TabsTrigger>
              <TabsTrigger value="prontuario">Prontuários</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 bg-gray-300 rounded" />
                        <div className="flex-1">
                          <div className="h-5 w-32 bg-gray-300 rounded mb-2" />
                          <div className="h-4 w-48 bg-gray-300 rounded" />
                        </div>
                      </div>
                      <div className="h-8 w-24 bg-gray-300 rounded" />
                    </div>
                  ))}
                </div>
              ) : filteredDocumentos.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    {searchQuery ? 'Nenhum documento encontrado' : 'Nenhum documento disponível'}
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery 
                      ? 'Tente ajustar os termos de busca.' 
                      : 'Seus documentos médicos aparecerão aqui após as consultas.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDocumentos.map((documento) => (
                    <div
                      key={`${documento.tipo}-${documento.id}`}
                      className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        {getTipoIcon(documento.tipo)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">{documento.titulo}</h4>
                            <Badge className={getStatusColor(documento.status)}>
                              {documento.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(documento.data), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {documento.medico_nome}
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              {documento.tipo.charAt(0).toUpperCase() + documento.tipo.slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(documento)}
                        className="flex-shrink-0 ml-3"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {documento.arquivo_pdf ? 'Baixar PDF' : 'Gerar PDF'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentosMedicos;
