import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ptBR } from 'date-fns/locale';
import { usePdfGenerator } from '@/hooks/usePdfGenerator';
import jsPDF from 'jspdf';

interface LaudoPreviewProps {
  onBack: () => void;
  laudoData: {
    id_paciente: number;
    paciente?: {
      nome: string;
      idade: number;
      genero?: string;
      endereco?: string;
    };
    tipo_laudo: string;
    objetivo: string;
    descricao: string;
    conclusao: string;
    observacoes?: string;
    assinado: boolean;
    data_criacao?: string;
  };
  medicoInfo?: {
    nome: string;
    crm: string;
    especialidade: string;
  };
}

const LaudoPreview: React.FC<LaudoPreviewProps> = ({ onBack, laudoData, medicoInfo }) => {
  const { toast } = useToast();
  const [gerando, setGerando] = useState(false);
  const [laudoGerado, setLaudoGerado] = useState(false);
  const { elementRef, generatePdf, download, pdfBlob } = usePdfGenerator();

  // Não precisamos dessa referência, já que usamos elementRef do hook usePdfGenerator

  // Variável para armazenar o nome do arquivo PDF
  const [fileName, setFileName] = useState<string>('');
  
  const handleGerarPdf = async () => {
    // Se o PDF já foi gerado, apenas fazer o download novamente
    if (laudoGerado && fileName) {
      download(fileName);
      toast({
        title: "Download iniciado",
        description: "O arquivo PDF está sendo baixado novamente.",
        variant: "default",
      });
      return;
    }
    
    setGerando(true);
    
    try {
      // Verificar se a referência está apontando para um elemento válido
      if (!elementRef.current) {
        console.error('Elemento para PDF não encontrado');
        throw new Error('Elemento para PDF não encontrado');
      }
      
      console.log('Gerando PDF a partir do elemento:', elementRef.current);
      
      // Preparar o nome do arquivo
      const nomePaciente = laudoData.paciente?.nome || 'paciente';
      const dataFormatada = format(new Date(), 'ddMMyyyy');
      const newFileName = `laudo_medico_${nomePaciente.toLowerCase().replace(/\s+/g, '_')}_${dataFormatada}.pdf`;
      setFileName(newFileName);
      
      // Gerar o PDF
      const blob = await generatePdf();
      
      if (blob) {
        // Fazer o download do PDF
        download(newFileName);
        
        setLaudoGerado(true);
        toast({
          title: "Laudo gerado com sucesso!",
          description: "O laudo médico foi gerado e está pronto para download.",
          variant: "default",
        });
      } else {
        throw new Error('Não foi possível gerar o PDF');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o arquivo PDF do laudo.",
        variant: "destructive",
      });
    } finally {
      setGerando(false);
    }
  };

  // Formatando o tipo de laudo para exibição
  const formatTipoLaudo = (tipo: string) => {
    switch (tipo) {
      case 'admissional': return 'Laudo Admissional';
      case 'demissional': return 'Laudo Demissional';
      case 'pericial': return 'Laudo Pericial';
      case 'aptidao_fisica': return 'Laudo de Aptidão Física';
      case 'retorno_trabalho': return 'Laudo de Retorno ao Trabalho';
      case 'afastamento': return 'Laudo para Afastamento';
      case 'pdf_anexo': return 'Laudo com Anexo PDF';
      default: return 'Laudo Médico';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Preview do Laudo Médico</h2>
            <p className="text-sm text-gray-500">
              {laudoData.data_criacao 
                ? `Data: ${format(new Date(laudoData.data_criacao), 'dd/MM/yyyy', { locale: ptBR })}`
                : `Data: ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`
              }
            </p>
          </div>
        </div>
        <Button
          onClick={handleGerarPdf}
          disabled={gerando}
          className={`${laudoGerado ? 'bg-hopecann-green hover:bg-hopecann-green/90' : 'bg-hopecann-teal hover:bg-hopecann-teal/90'} text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-md`}
          title={laudoGerado ? "Clique para baixar o PDF novamente" : "Gerar PDF do laudo médico"}
          aria-label={laudoGerado ? "Baixar PDF novamente" : "Gerar PDF do laudo"}
        >
          {gerando ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Gerando PDF...
            </>
          ) : laudoGerado ? (
            <>
              <Download className="h-4 w-4 mr-2 animate-pulse" /> Baixar PDF
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" /> Gerar PDF
            </>
          )}
        </Button>
      </div>

      {/* Preview do Laudo em formato de documento */}
      <div ref={elementRef} id="laudo-para-imprimir" className="border rounded-lg overflow-hidden bg-white shadow-md print:border-0 print:shadow-none">
        {/* Cabeçalho do Laudo */}
        <div className="p-6 border-b bg-hopecann-green/5">
          <div className="flex flex-col items-center text-center mb-6">
            <h1 className="text-xl font-bold text-hopecann-green mb-1">HopeCann Clinic</h1>
            <p className="text-sm text-gray-600">Centro Especializado em Tratamentos Medicinais Alternativos</p>
            <p className="text-sm text-gray-600">CNPJ: 12.345.678/0001-00</p>
          </div>
          
          <h2 className="text-xl font-bold text-center mb-6 text-hopecann-teal border-y-2 border-hopecann-teal/20 py-2">
            {formatTipoLaudo(laudoData.tipo_laudo)}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-600">Dados do Paciente</h3>
              <div className="mt-2 space-y-1">
                <p><span className="font-medium">Nome:</span> {laudoData.paciente?.nome || 'Não informado'}</p>
                <p><span className="font-medium">Idade:</span> {laudoData.paciente?.idade || 'Não informada'} anos</p>
                {laudoData.paciente?.genero && (
                  <p><span className="font-medium">Gênero:</span> {
                    laudoData.paciente.genero === 'masculino' ? 'Masculino' : 
                    laudoData.paciente.genero === 'feminino' ? 'Feminino' : 'Outro'
                  }</p>
                )}
                {laudoData.paciente?.endereco && (
                  <p><span className="font-medium">Endereço:</span> {laudoData.paciente.endereco}</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-600">Dados do Médico</h3>
              <div className="mt-2 space-y-1">
                <p><span className="font-medium">Nome:</span> {medicoInfo?.nome || 'Não informado'}</p>
                <p><span className="font-medium">CRM:</span> {medicoInfo?.crm || 'Não informado'}</p>
                <p><span className="font-medium">Especialidade:</span> {medicoInfo?.especialidade || 'Não informada'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Corpo do Laudo */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-hopecann-teal flex items-center gap-2">
              <FileText className="h-5 w-5" /> Objetivo do Laudo
            </h3>
            <div className="p-4 bg-gray-50 rounded-md min-h-[80px] whitespace-pre-wrap border border-hopecann-green/20">
              {laudoData.objetivo || 'Não informado'}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-hopecann-teal flex items-center gap-2">
              <FileText className="h-5 w-5" /> Descrição Clínica
            </h3>
            <div className="p-4 bg-gray-50 rounded-md min-h-[150px] whitespace-pre-wrap border border-hopecann-green/20">
              {laudoData.descricao || 'Não informado'}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-hopecann-teal flex items-center gap-2">
              <FileText className="h-5 w-5" /> Conclusão
            </h3>
            <div className="p-4 bg-gray-50 rounded-md min-h-[100px] whitespace-pre-wrap border border-hopecann-green/20">
              {laudoData.conclusao || 'Não informado'}
            </div>
          </div>
          
          {laudoData.observacoes && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-hopecann-teal flex items-center gap-2">
                <FileText className="h-5 w-5" /> Observações Adicionais
              </h3>
              <div className="p-4 bg-gray-50 rounded-md min-h-[80px] whitespace-pre-wrap border border-hopecann-green/20">
                {laudoData.observacoes}
              </div>
            </div>
          )}
        </div>
        
        {/* Rodapé do Laudo */}
        <div className="p-6 border-t bg-hopecann-green/5">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm text-gray-600 mb-1">
              {format(new Date(), "'São Paulo, 'dd' de 'MMMM' de 'yyyy", { locale: ptBR })}
            </p>
            
            <div className="mt-8 mb-4">
              <div className={`w-64 h-0.5 bg-black mx-auto ${laudoData.assinado ? 'mb-2' : 'mb-4'}`}></div>
              {laudoData.assinado && (
                <div className="flex justify-center items-center mb-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span className="text-xs">Assinado digitalmente</span>
                </div>
              )}
              <p className="text-sm font-medium">{medicoInfo?.nome || 'Nome do Médico'}</p>
              <p className="text-xs text-gray-600">CRM {medicoInfo?.crm || '00000'} - {medicoInfo?.especialidade || 'Especialidade'}</p>
            </div>
            
            <div className="text-xs text-gray-500 mt-4">
              <p>Este documento é um laudo médico oficial e possui validade legal.</p>
              <p>HopeCann Clinic - Todos os direitos reservados © {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaudoPreview;
