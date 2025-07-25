
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  FileText, 
  Clock 
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteTemplateExame } from '@/services/exames/examesService';
import { useToast } from '@/hooks/use-toast';

interface ExameTemplateItemProps {
  template: {
    id: number;
    nome: string;
    nome_exame: string;
    justificativa: string;
    prioridade: string;
    instrucoes: string;
    frequencia_uso: number;
  };
  onSelect: (template: any) => void;
  onDelete: (id: number) => void;
}

const ExameTemplateItem: React.FC<ExameTemplateItemProps> = ({
  template,
  onSelect,
  onDelete
}) => {
  const { toast } = useToast();
  
  const handleDelete = async () => {
    try {
      console.log('Deletando template:', template.id);
      await deleteTemplateExame(template.id);
      onDelete(template.id);
      toast({
        title: "Template excluído",
        description: "O template foi removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir o template",
      });
    }
  };
  
  return (
    <div className="bg-white p-3 rounded-md border hover:border-slate-300 transition-colors">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-medium text-slate-800 truncate">{template.nome}</h4>
        <div className="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0">
          <Clock className="h-3 w-3" />
          <span>{template.frequencia_uso} usos</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 truncate">{template.nome_exame}</p>
      
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
          onClick={() => onSelect(template)}
        >
          <FileText className="h-3 w-3 mr-1" /> Usar
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir template</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o template "{template.nome}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ExameTemplateItem;
