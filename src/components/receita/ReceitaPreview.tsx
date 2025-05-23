import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Printer, Download, CheckCircle, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ReceitaPreviewProps {
  paciente: {
    nome: string;
    cpf?: string;
    data_nascimento?: string;
  };
  medico: {
    nome: string;
    crm: string;
    especialidade: string;
  };
  receita: {
    medicamento: string;
    posologia: string;
    tempoUso: string;
    periodo: string;
    permiteSubstituicao: string;
    cid?: string;
    tipoReceita: string;
    observacoes?: string;
    data_criacao: Date;
    data_validade: Date;
  };
  onConfirm: () => void;
  onCancel: () => void;
  onPrint: () => void;
  onDownload: () => void;
}

const ReceitaPreview: React.FC<ReceitaPreviewProps> = ({
  paciente,
  medico,
  receita,
  onConfirm,
  onCancel,
  onPrint,
  onDownload
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Prévia da Receita</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="overflow-auto flex-1 p-4">
          <div className="bg-white p-8 shadow-sm border rounded-lg min-h-[297mm] w-full max-w-[210mm] mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Cabeçalho */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">HOPE CANN CONNECT</h1>
              <h2 className="text-xl font-semibold mt-2">PRESCRIÇÃO MÉDICA</h2>
              <p className="mt-2"><strong>Tipo:</strong> {receita.tipoReceita.toUpperCase()}</p>
            </div>
            
            <div className="border-t border-gray-300 my-4"></div>
            
            {/* Informações do Paciente */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold border-b pb-1 mb-2">Informações do Paciente</h3>
              <p><strong>Nome:</strong> {paciente.nome}</p>
              {paciente.cpf && <p><strong>CPF:</strong> {paciente.cpf}</p>}
              {paciente.data_nascimento && (
                <p><strong>Data de Nascimento:</strong> {paciente.data_nascimento}</p>
              )}
            </div>
            
            {/* Prescrição */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold border-b pb-1 mb-2">Prescrição</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="font-semibold">{receita.medicamento}</p>
                <p><strong>Posologia:</strong> {receita.posologia}</p>
                <p><strong>Tempo de Uso:</strong> {receita.tempoUso} {receita.periodo}</p>
                <p><strong>Permite Substituição:</strong> {receita.permiteSubstituicao}</p>
                {receita.cid && <p><strong>CID:</strong> {receita.cid}</p>}
              </div>
            </div>
            
            {/* Observações */}
            {receita.observacoes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold border-b pb-1 mb-2">Observações</h3>
                <p>{receita.observacoes}</p>
              </div>
            )}
            
            {/* Datas */}
            <div className="mb-6">
              <p><strong>Data de Emissão:</strong> {format(receita.data_criacao, "dd/MM/yyyy")}</p>
              <p><strong>Validade:</strong> {format(receita.data_validade, "dd/MM/yyyy")}</p>
            </div>
            
            {/* Assinatura */}
            <div className="mt-16 text-center">
              <div className="w-64 mx-auto border-t border-black"></div>
              <p className="mt-2 font-semibold">{medico.nome}</p>
              <p>CRM: {medico.crm}</p>
              <p>{medico.especialidade}</p>
            </div>
            
            {/* Rodapé */}
            <div className="mt-12 text-center text-sm text-gray-500">
              <p>Documento gerado digitalmente pelo sistema Hope Cann Connect</p>
              <p>© {new Date().getFullYear()} - Todos os direitos reservados</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex flex-wrap gap-2">
          <Button variant="outline" className="flex-1" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
          <Button variant="outline" className="flex-1" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" /> Baixar PDF
          </Button>
          <Button variant="destructive" className="flex-1" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" /> Cancelar
          </Button>
          <Button variant="default" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={onConfirm}>
            <CheckCircle className="h-4 w-4 mr-2" /> Confirmar e Salvar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReceitaPreview;
