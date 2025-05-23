import React, { forwardRef } from 'react';
import { format } from 'date-fns';

interface TemplateReceitaProps {
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
}

const TemplateReceita = forwardRef<HTMLDivElement, TemplateReceitaProps>(
  ({ paciente, medico, receita }, ref) => {
    return (
      <div 
        ref={ref} 
        className="p-8 bg-white" 
        style={{ width: '210mm', height: '297mm', fontFamily: 'Arial, sans-serif' }}
      >
        <div className="border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-center text-blue-700">HOPE CANN CONNECT</h1>
          <h2 className="text-xl font-semibold text-center mb-2">PRESCRIÇÃO MÉDICA</h2>
          <p className="text-sm text-center text-gray-500">Tipo: {receita.tipoReceita.toUpperCase()}</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 bg-gray-100 p-1">Informações do Paciente</h3>
          <p className="mb-1"><strong>Nome:</strong> {paciente.nome}</p>
          {paciente.cpf && <p className="mb-1"><strong>CPF:</strong> {paciente.cpf}</p>}
          {paciente.data_nascimento && <p className="mb-1"><strong>Data de Nascimento:</strong> {paciente.data_nascimento}</p>}
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2 bg-gray-100 p-1">Prescrição</h3>
          <div className="mb-4 p-4 border border-gray-200 rounded">
            <p className="mb-2 text-lg font-medium">{receita.medicamento}</p>
            <p className="mb-1"><strong>Posologia:</strong> {receita.posologia}</p>
            <p className="mb-1"><strong>Tempo de Uso:</strong> {receita.tempoUso} {receita.periodo}</p>
            <p className="mb-1"><strong>Permite Substituição:</strong> {receita.permiteSubstituicao}</p>
            {receita.cid && <p className="mb-1"><strong>CID:</strong> {receita.cid}</p>}
          </div>
          
          {receita.observacoes && (
            <div className="mb-4">
              <p className="font-medium">Observações:</p>
              <p className="italic p-2 bg-gray-50 border-l-2 border-gray-300">{receita.observacoes}</p>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <p className="mb-1"><strong>Data de Emissão:</strong> {format(receita.data_criacao, "dd/MM/yyyy")}</p>
          <p className="mb-1"><strong>Validade:</strong> {format(receita.data_validade, "dd/MM/yyyy")}</p>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-300 text-center">
          <div className="mb-1 mx-auto w-64 border-b border-black"></div>
          <p className="font-medium">{medico.nome}</p>
          <p className="text-sm">CRM: {medico.crm} - {medico.especialidade}</p>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-500">
          <p>Documento gerado digitalmente pelo sistema Hope Cann Connect</p>
          <p>© {new Date().getFullYear()} - Todos os direitos reservados</p>
        </div>
      </div>
    );
  }
);

export default TemplateReceita;
