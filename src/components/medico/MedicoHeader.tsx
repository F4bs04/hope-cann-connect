
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, LogOut, Key, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ChangePasswordDialog from '@/components/profile/ChangePasswordDialog';

const MedicoHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userType');
      navigate('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível fazer logout. Tente novamente.",
      });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-hopecann-teal/10 p-2 rounded-full">
            <Stethoscope className="h-6 w-6 text-hopecann-teal" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Área do Médico</h1>
            <p className="text-sm text-gray-600">Painel de Controle</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-gray-700 hover:text-gray-900">
                <Settings className="w-4 h-4 mr-2" />
                Perfil
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <ChangePasswordDialog>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Key className="w-4 h-4 mr-2" />
                  Alterar Senha
                </DropdownMenuItem>
              </ChangePasswordDialog>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default MedicoHeader;
