
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUserInfo } from '@/hooks/useCurrentUserInfo';
import { useToast } from '@/hooks/use-toast';

interface MedicoAuthData {
  isAuthenticated: boolean;
  isMedico: boolean;
  medicoId: number | null;
  isApproved: boolean;
  permissions: string[];
}

export function useMedicoAuth() {
  const [authData, setAuthData] = useState<MedicoAuthData>({
    isAuthenticated: false,
    isMedico: false,
    medicoId: null,
    isApproved: false,
    permissions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { userInfo, loading: userLoading } = useCurrentUserInfo();
  const { toast } = useToast();

  useEffect(() => {
    const checkMedicoAuth = async () => {
      try {
        if (userLoading) return;

        if (!userInfo.id || userInfo.userType !== 'medico') {
          setAuthData({
            isAuthenticated: false,
            isMedico: false,
            medicoId: null,
            isApproved: false,
            permissions: []
          });
          return;
        }

        // Verificar se o médico está aprovado
        const { data: medicoData, error } = await supabase
          .from('medicos')
          .select('id, aprovado, status_disponibilidade')
          .eq('id', userInfo.medicoId)
          .single();

        if (error) throw error;

        // Buscar permissões (se houver sistema de permissões)
        const permissions: string[] = ['dashboard', 'agenda', 'pacientes', 'receitas']; // Permissões básicas

        setAuthData({
          isAuthenticated: true,
          isMedico: true,
          medicoId: medicoData.id,
          isApproved: medicoData.aprovado,
          permissions
        });

        if (!medicoData.aprovado) {
          toast({
            title: "Conta pendente de aprovação",
            description: "Sua conta ainda está sendo analisada pela administração.",
            variant: "destructive"
          });
        }

      } catch (error) {
        console.error('Erro ao verificar autenticação médica:', error);
        toast({
          title: "Erro de autenticação",
          description: "Não foi possível verificar suas credenciais.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkMedicoAuth();
  }, [userInfo, userLoading, toast]);

  const hasPermission = (permission: string) => {
    return authData.permissions.includes(permission);
  };

  const requireApproval = () => {
    if (!authData.isApproved) {
      toast({
        title: "Acesso restrito",
        description: "Esta funcionalidade requer aprovação da conta.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  return {
    ...authData,
    isLoading,
    hasPermission,
    requireApproval
  };
}
