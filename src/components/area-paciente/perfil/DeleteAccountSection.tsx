
import React from 'react';
import { Button } from '@/components/ui/button';
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
} from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react';

interface DeleteAccountSectionProps {
  onDeleteAccount: () => Promise<void>;
}

const DeleteAccountSection: React.FC<DeleteAccountSectionProps> = ({ onDeleteAccount }) => {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full sm:w-auto flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Excluir Dados do Perfil
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão de Dados</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Seus dados associados ao perfil de paciente serão permanentemente excluídos.
              Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteAccount} className="bg-red-600 hover:bg-red-700">
              Sim, Excluir Meus Dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p className="mt-2 text-xs text-gray-500 text-center sm:text-left">
        A exclusão removerá apenas os dados do seu perfil de paciente. Sua conta de autenticação no sistema permanecerá ativa.
      </p>
    </div>
  );
};

export default DeleteAccountSection;
