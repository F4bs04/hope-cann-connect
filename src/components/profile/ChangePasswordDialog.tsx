import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Key, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

interface ChangePasswordDialogProps {
  children: React.ReactNode;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    setIsLoading(true);
    
    try {
      // Primeiro, verificar se a senha atual está correta
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Tentar fazer login com a senha atual para verificar se está correta
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: values.currentPassword,
      });

      if (signInError) {
        throw new Error('Senha atual incorreta');
      }

      // Se chegou até aqui, a senha atual está correta, agora atualizar para a nova
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Senha alterada com sucesso!",
        description: "Sua senha foi atualizada. Use a nova senha no próximo login.",
        variant: "default"
      });

      // Limpar formulário e fechar dialog
      form.reset();
      setIsOpen(false);

    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      
      let errorMessage = 'Erro inesperado ao alterar senha.';
      
      if (error.message === 'Senha atual incorreta') {
        errorMessage = 'A senha atual está incorreta.';
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'A nova senha deve ter pelo menos 6 caracteres.';
      } else if (error.message?.includes('Unable to validate email address')) {
        errorMessage = 'Não foi possível validar o email. Tente novamente.';
      }

      toast({
        title: "Erro ao alterar senha",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-hopecann-teal" />
            Alterar Senha da Conta
          </DialogTitle>
          <DialogDescription>
            Para sua segurança, confirme sua senha atual e defina uma nova senha.
            <br />
            <span className="text-amber-600 font-medium">
              Esta opção é para usuários logados que sabem a senha atual.
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Senha Atual */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Digite sua senha atual"
                {...form.register('currentPassword')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.currentPassword && (
              <p className="text-sm text-red-600">{form.formState.errors.currentPassword.message}</p>
            )}
          </div>

          {/* Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Digite sua nova senha"
                {...form.register('newPassword')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.newPassword && (
              <p className="text-sm text-red-600">{form.formState.errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirmar Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirme sua nova senha"
                {...form.register('confirmPassword')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Requisitos da Senha */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Requisitos da nova senha:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Mínimo de 6 caracteres</li>
              <li>• As senhas devem coincidir</li>
              <li>• Diferente da senha atual</li>
            </ul>
          </div>
          
          {/* Aviso sobre esquecimento de senha */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="text-sm font-medium text-amber-800 mb-1">🔑 Esqueceu sua senha?</h4>
            <p className="text-xs text-amber-700">
              Se você não lembra sua senha atual, use a opção 
              <span className="font-medium"> "Esqueceu sua senha?"</span> na tela de login.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Alterando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Alterar Senha
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
