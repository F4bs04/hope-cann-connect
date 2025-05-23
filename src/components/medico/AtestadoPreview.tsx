import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ptBR } from 'date-fns/locale';
import { usePdfGenerator } from '@/hooks/usePdfGenerator';

interface AtestadoPreviewProps {
  onBack: () => void;
  atestadoData: {
    id_paciente: number;
    paciente?: {
      nome: string;
      idade?: number;
      genero?: string;
      endereco?: string;
    };
    data_consulta: Date;
    tempo_afastamento: string;
    unidade: string;
    justificativa: string;
    assinado: boolean;
    data_emissao?: string;
  };
  medicoInfo?: {
    nome: string;
    crm: string;
    especialidade: string;
  };
}

const AtestadoPreview: React.FC<AtestadoPreviewProps> = ({ onBack, atestadoData, medicoInfo }) => {
  const { toast } = useToast();
  const [gerando, setGerando] = useState(false);
  const [atestadoGerado, setAtestadoGerado] = useState(false);
  const { elementRef, generatePdf, download, pdfBlob } = usePdfGenerator();

  // Variável para armazenar o nome do arquivo PDF
  const [fileName, setFileName] = useState<string>('');
  
  const handleGerarPdf = async () => {
    // Se o PDF já foi gerado, apenas fazer o download novamente
    if (atestadoGerado && fileName) {
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
      const nomePaciente = atestadoData.paciente?.nome || 'paciente';
      const dataFormatada = format(new Date(), 'ddMMyyyy');
      const newFileName = `atestado_medico_${nomePaciente.toLowerCase().replace(/\s+/g, '_')}_${dataFormatada}.pdf`;
      setFileName(newFileName);
      
      // Gerar o PDF
      const blob = await generatePdf();
      
      if (blob) {
        // Fazer o download do PDF
        download(newFileName);
        
        setAtestadoGerado(true);
        toast({
          title: "Atestado gerado com sucesso!",
          description: "O atestado médico foi gerado e está pronto para download.",
          variant: "default",
        });
      } else {
        throw new Error('Não foi possível gerar o PDF');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o arquivo PDF do atestado.",
        variant: "destructive",
      });
    } finally {
      setGerando(false);
    }
  };

  // Formatando a data para exibição
  const formatarData = (data: Date | string) => {
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    return format(dataObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Preview do Atestado Médico</h2>
            <p className="text-sm text-gray-500">
              {atestadoData.data_emissao 
                ? `Data: ${formatarData(atestadoData.data_emissao)}`
                : `Data: ${formatarData(new Date())}`
              }
            </p>
          </div>
        </div>
        <Button
          onClick={handleGerarPdf}
          disabled={gerando}
          className={`${atestadoGerado ? 'bg-hopecann-green hover:bg-hopecann-green/90' : 'bg-hopecann-teal hover:bg-hopecann-teal/90'} text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-md`}
          title={atestadoGerado ? "Clique para baixar o PDF novamente" : "Gerar PDF do atestado médico"}
          aria-label={atestadoGerado ? "Baixar PDF novamente" : "Gerar PDF do atestado"}
        >
          {gerando ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Gerando PDF...
            </>
          ) : atestadoGerado ? (
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

      {/* Preview do Atestado em formato de documento */}
      <div ref={elementRef} id="atestado-para-imprimir" className="border rounded-lg overflow-hidden bg-white shadow-md print:border-0 print:shadow-none">
        {/* Cabeçalho do Atestado */}
        <div className="p-6 border-b bg-hopecann-green/5">
          <div className="flex flex-col items-center text-center mb-6">
            <h1 className="text-2xl font-bold text-hopecann-green">ATESTADO MÉDICO</h1>
            <p className="text-sm text-gray-600 mt-1">
              {`Emitido em: ${formatarData(atestadoData.data_consulta || new Date())}`}
            </p>
            <p className="text-sm text-gray-600">
              Doc. Nº {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}/{new Date().getFullYear()}
            </p>
          </div>
          
          {/* Informações de Identificação */}
          <div className="grid grid-cols-2 gap-8 mt-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-600">Dados do Paciente</h3>
              <div className="mt-2 space-y-1">
                <p><span className="font-medium">Nome:</span> {atestadoData.paciente?.nome || 'Não informado'}</p>
                {atestadoData.paciente?.idade && (
                  <p><span className="font-medium">Idade:</span> {atestadoData.paciente.idade} anos</p>
                )}
                {atestadoData.paciente?.genero && (
                  <p><span className="font-medium">Gênero:</span> {atestadoData.paciente.genero}</p>
                )}
                {atestadoData.paciente?.endereco && (
                  <p><span className="font-medium">Endereço:</span> {atestadoData.paciente.endereco}</p>
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
        
        {/* Corpo do Atestado */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-hopecann-teal flex items-center gap-2">
              <FileText className="h-5 w-5" /> Declaração
            </h3>
            <div className="p-4 bg-gray-50 rounded-md min-h-[150px] border border-hopecann-green/20">
              <p className="text-justify">
                Atesto para os devidos fins que o(a) paciente acima identificado(a) deverá 
                permanecer afastado(a) de suas atividades habituais por um período 
                de <strong>{atestadoData.tempo_afastamento} {atestadoData.unidade}</strong>, 
                a partir da presente data.
              </p>
              
              <p className="mt-4 font-medium">Justificativa:</p>
              <p className="mt-2 whitespace-pre-wrap">{atestadoData.justificativa || 'Não informada'}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-hopecann-teal flex items-center gap-2">
              <FileText className="h-5 w-5" /> Observações Adicionais
            </h3>
            <div className="p-4 bg-gray-50 rounded-md min-h-[100px] border border-hopecann-green/20">
              <p>
                Este atestado tem validade legal e está em conformidade com as regulamentações 
                do Conselho Federal de Medicina e normas vigentes.
              </p>
            </div>
          </div>
        </div>
        
        {/* Rodapé do Atestado */}
        <div className="p-6 border-t bg-hopecann-green/5">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm text-gray-600 mb-1">
              {format(new Date(), "'São Paulo, 'dd' de 'MMMM' de 'yyyy", { locale: ptBR })}
            </p>
            
            <div className="mt-8 mb-4">
              <div className={`w-64 h-0.5 bg-black mx-auto ${atestadoData.assinado ? 'mb-2' : 'mb-4'}`}></div>
              {atestadoData.assinado && (
                <div className="flex justify-center items-center mb-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span className="text-xs">Assinado digitalmente</span>
                </div>
              )}
              <p className="text-sm font-medium">{medicoInfo?.nome || 'Nome do Médico'}</p>
              <p className="text-xs text-gray-600">CRM {medicoInfo?.crm || '00000'} - {medicoInfo?.especialidade || 'Especialidade'}</p>
            </div>
            
            <div className="text-xs text-gray-500 mt-4">
              <p>Este documento é um atestado médico oficial e possui validade legal.</p>
              <p>HopeCann Clinic - Todos os direitos reservados © {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtestadoPreview;
