import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ptBR } from 'date-fns/locale';
import { usePdfGenerator } from '@/hooks/usePdfGenerator';

interface ExamePreviewProps {
  onBack: () => void;
  exameData: {
    id_paciente: number;
    paciente?: {
      nome: string;
      idade?: number;
      genero?: string;
      endereco?: string;
    };
    nome_exame: string;
    justificativa: string;
    prioridade: string;
    instrucoes?: string;
    assinado: boolean;
    data_emissao?: string;
  };
  medicoInfo?: {
    nome: string;
    crm: string;
    especialidade: string;
  };
}

const ExamePreview: React.FC<ExamePreviewProps> = ({ onBack, exameData, medicoInfo }) => {
  const { toast } = useToast();
  const [gerando, setGerando] = useState(false);
  const [exameGerado, setExameGerado] = useState(false);
  const { elementRef, generatePdf, download, pdfBlob } = usePdfGenerator();

  // Variável para armazenar o nome do arquivo PDF
  const [fileName, setFileName] = useState<string>('');
  
  const handleGerarPdf = async () => {
    // Se o PDF já foi gerado, apenas fazer o download novamente
    if (exameGerado && fileName) {
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
      const nomePaciente = exameData.paciente?.nome || 'paciente';
      const dataFormatada = format(new Date(), 'ddMMyyyy');
      const newFileName = `pedido_exame_${nomePaciente.toLowerCase().replace(/\s+/g, '_')}_${dataFormatada}.pdf`;
      setFileName(newFileName);
      
      // Gerar o PDF
      const blob = await generatePdf();
      
      if (blob) {
        // Fazer o download do PDF
        download(newFileName);
        
        setExameGerado(true);
        toast({
          title: "Pedido de exame gerado com sucesso!",
          description: "O pedido de exame foi gerado e está pronto para download.",
          variant: "default",
        });
      } else {
        throw new Error('Não foi possível gerar o PDF');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o arquivo PDF do pedido de exame.",
        variant: "destructive",
      });
    } finally {
      setGerando(false);
    }
  };

  // Formatando a prioridade para exibição
  const formatPrioridade = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente': return 'Urgente';
      case 'alta': return 'Alta';
      case 'rotina': return 'Rotina';
      default: return prioridade;
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
            <h2 className="text-2xl font-bold">Preview do Pedido de Exame</h2>
            <p className="text-sm text-gray-500">
              {exameData.data_emissao 
                ? `Data: ${format(new Date(exameData.data_emissao), 'dd/MM/yyyy', { locale: ptBR })}`
                : `Data: ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`
              }
            </p>
          </div>
        </div>
        <Button
          onClick={handleGerarPdf}
          disabled={gerando}
          className={`${exameGerado ? 'bg-hopecann-green hover:bg-hopecann-green/90' : 'bg-hopecann-teal hover:bg-hopecann-teal/90'} text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-md`}
          title={exameGerado ? "Clique para baixar o PDF novamente" : "Gerar PDF do pedido de exame"}
          aria-label={exameGerado ? "Baixar PDF novamente" : "Gerar PDF do pedido"}
        >
          {gerando ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Gerando PDF...
            </>
          ) : exameGerado ? (
            <>
              <Download className="h-4 w-4 mr-2 animate-pulse" /> Baixar PDF
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" /> Gerar PDF
            </>
          )}
        </Button>
      </div>

      {/* Preview do Pedido de Exame em formato de documento */}
      <div ref={elementRef} id="exame-para-imprimir" className="border rounded-lg overflow-hidden bg-white shadow-md print:border-0 print:shadow-none">
        {/* Cabeçalho do Pedido de Exame */}
        <div className="p-6 border-b bg-hopecann-green/5">
          <div className="flex flex-col items-center text-center mb-6">
            <h1 className="text-2xl font-bold text-hopecann-green">SOLICITAÇÃO DE EXAME</h1>
            <p className="text-sm text-gray-600 mt-1">
              {`Emitido em: ${format(new Date(exameData.data_emissao || new Date()), 'dd/MM/yyyy', { locale: ptBR })}`}
            </p>
            <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-blue-600">
              Prioridade: {formatPrioridade(exameData.prioridade)}
            </div>
          </div>
          
          {/* Informações de Identificação */}
          <div className="grid grid-cols-2 gap-8 mt-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-600">Dados do Paciente</h3>
              <div className="mt-2 space-y-1">
                <p><span className="font-medium">Nome:</span> {exameData.paciente?.nome || 'Não informado'}</p>
                {exameData.paciente?.idade && (
                  <p><span className="font-medium">Idade:</span> {exameData.paciente.idade} anos</p>
                )}
                {exameData.paciente?.genero && (
                  <p><span className="font-medium">Gênero:</span> {exameData.paciente.genero}</p>
                )}
                {exameData.paciente?.endereco && (
                  <p><span className="font-medium">Endereço:</span> {exameData.paciente.endereco}</p>
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
        
        {/* Corpo do Pedido de Exame */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-hopecann-teal flex items-center gap-2">
              <FileText className="h-5 w-5" /> Exame Solicitado
            </h3>
            <div className="p-4 bg-gray-50 rounded-md min-h-[80px] border border-hopecann-green/20">
              <p className="text-lg font-medium text-gray-800">{exameData.nome_exame || 'Não informado'}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-hopecann-teal flex items-center gap-2">
              <FileText className="h-5 w-5" /> Justificativa Clínica
            </h3>
            <div className="p-4 bg-gray-50 rounded-md min-h-[150px] whitespace-pre-wrap border border-hopecann-green/20">
              {exameData.justificativa || 'Não informada'}
            </div>
          </div>
          
          {exameData.instrucoes && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-hopecann-teal flex items-center gap-2">
                <FileText className="h-5 w-5" /> Instruções ao Paciente
              </h3>
              <div className="p-4 bg-gray-50 rounded-md min-h-[100px] whitespace-pre-wrap border border-hopecann-green/20">
                {exameData.instrucoes}
              </div>
            </div>
          )}
        </div>
        
        {/* Rodapé do Pedido de Exame */}
        <div className="p-6 border-t bg-hopecann-green/5">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm text-gray-600 mb-1">
              {format(new Date(), "'São Paulo, 'dd' de 'MMMM' de 'yyyy", { locale: ptBR })}
            </p>
            
            <div className="mt-8 mb-4">
              <div className={`w-64 h-0.5 bg-black mx-auto ${exameData.assinado ? 'mb-2' : 'mb-4'}`}></div>
              {exameData.assinado && (
                <div className="flex justify-center items-center mb-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span className="text-xs">Assinado digitalmente</span>
                </div>
              )}
              <p className="text-sm font-medium">{medicoInfo?.nome || 'Nome do Médico'}</p>
              <p className="text-xs text-gray-600">CRM {medicoInfo?.crm || '00000'} - {medicoInfo?.especialidade || 'Especialidade'}</p>
            </div>
            
            <div className="text-xs text-gray-500 mt-4">
              <p>Este documento é um pedido de exame oficial e possui validade legal.</p>
              <p>HopeCann Clinic - Todos os direitos reservados © {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamePreview;
