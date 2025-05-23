
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

interface TermosResponsabilidadeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermosResponsabilidade = ({ open, onOpenChange }: TermosResponsabilidadeProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Termo de Consciência e Responsabilidade</DialogTitle>
          <DialogDescription>
            Leia com atenção os termos abaixo
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p>Os produtos à base de cannabis medicinal são regulamentados pela Anvisa (Agência Nacional de Vigilância Sanitária) por meio da Resolução da Diretoria Colegiada (RDC) n° 327/2019, que estabelece os procedimentos para a concessão da Autorização Sanitária e para o registro de produtos derivados de cannabis.</p>
          
          <p>Como médico prescritor, declaro estar ciente que:</p>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>A prescrição de produtos à base de cannabis deve seguir as diretrizes da RDC 327/2019, exigindo registro no Conselho Federal de Medicina e retenção de receita.</li>
            <li>Sou responsável pelo acompanhamento do paciente, monitoramento de efeitos colaterais e reações adversas.</li>
            <li>Devo informar adequadamente o paciente sobre riscos, benefícios e alternativas terapêuticas.</li>
            <li>A prescrição deve ser baseada em evidências científicas e na resposta individual do paciente ao tratamento.</li>
            <li>Reconheço que há limitações nos estudos sobre eficácia e segurança em longo prazo de alguns produtos canábicos.</li>
            <li>Devo estar atualizado sobre as pesquisas e regulamentações referentes à cannabis medicinal.</li>
            <li>Entendo que a prescrição deve ser feita em receituário do tipo B (azul), com identificação do prescritor e do paciente.</li>
          </ol>
          
          <p className="font-semibold">Ao concordar com este termo, assumo total responsabilidade pela prescrição de produtos à base de cannabis, reconhecendo os aspectos éticos, legais e profissionais envolvidos.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermosResponsabilidade;
