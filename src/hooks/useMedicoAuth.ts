
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
  const { userInfo, loading: userLoading, error: userError } = useCurrentUserInfo();
  const { toast } = useToast();

  useEffect(() => {
    const checkMedicoAuth = async () => {
      try {
        console.log('=== MEDICO AUTH DEBUG ===');
        console.log('userLoading:', userLoading);
        console.log('userError:', userError);
        console.log('userInfo:', userInfo);
        
        if (userLoading) {
          console.log('Still loading user info, waiting...');
          return;
        }

        if (userError) {
          console.error('User info error:', userError);
          setAuthData({
            isAuthenticated: false,
            isMedico: false,
            medicoId: null,
            isApproved: false,
            permissions: []
          });
          return;
        }

        // Verificar se temos informações básicas do usuário
        if (!userInfo.id) {
          console.log('No user ID found');
          setAuthData({
            isAuthenticated: false,
            isMedico: false,
            medicoId: null,
            isApproved: false,
            permissions: []
          });
          return;
        }

        // Verificar se é médico
        if (userInfo.userType !== 'medico') {
          console.log('User type is not medico:', userInfo.userType);
          setAuthData({
            isAuthenticated: true,
            isMedico: false,
            medicoId: null,
            isApproved: false,
            permissions: []
          });
          return;
        }

        console.log('User is medico, checking medico data...');
        console.log('medicoId from userInfo:', userInfo.medicoId);

        // Se não temos medicoId, tentar buscar pelo ID do usuário
        let medicoId = userInfo.medicoId;
        
        if (!medicoId) {
          console.log('No medicoId in userInfo, searching by user ID...');
          const { data: medicoSearchData, error: searchError } = await supabase
            .from('medicos')
            .select('id')
            .eq('id_usuario', userInfo.id)
            .maybeSingle();

          console.log('Search result:', medicoSearchData);
          console.log('Search error:', searchError);

          if (searchError) {
            console.error('Error searching medico by user ID:', searchError);
          } else if (medicoSearchData) {
            medicoId = medicoSearchData.id;
            console.log('Found medicoId:', medicoId);
          }
        }

        if (!medicoId) {
          console.log('No medicoId found, user authenticated but not a valid medico');
          setAuthData({
            isAuthenticated: true,
            isMedico: false,
            medicoId: null,
            isApproved: false,
            permissions: []
          });
          return;
        }

        // Buscar dados do médico
        console.log('Fetching medico data for ID:', medicoId);
        const { data: medicoData, error: medicoError } = await supabase
          .from('medicos')
          .select('id, aprovado, status_disponibilidade, nome')
          .eq('id', medicoId)
          .single();

        console.log('Medico data:', medicoData);
        console.log('Medico error:', medicoError);

        if (medicoError) {
          console.error('Error fetching medico data:', medicoError);
          throw medicoError;
        }

        if (!medicoData) {
          console.log('No medico data found');
          setAuthData({
            isAuthenticated: true,
            isMedico: false,
            medicoId: null,
            isApproved: false,
            permissions: []
          });
          return;
        }

        // Permissões básicas para médicos autenticados
        const permissions: string[] = ['dashboard', 'agenda', 'pacientes', 'receitas'];

        const finalAuthData = {
          isAuthenticated: true,
          isMedico: true,
          medicoId: medicoData.id,
          isApproved: medicoData.aprovado,
          permissions
        };

        console.log('Final auth data:', finalAuthData);
        setAuthData(finalAuthData);

        // Mostrar toast apenas se não aprovado
        if (!medicoData.aprovado) {
          toast({
            title: "Conta pendente de aprovação",
            description: "Sua conta ainda está sendo analisada pela administração.",
            variant: "destructive"
          });
        }

      } catch (error) {
        console.error('Erro ao verificar autenticação médica:', error);
        setAuthData({
          isAuthenticated: false,
          isMedico: false,
          medicoId: null,
          isApproved: false,
          permissions: []
        });
        
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
  }, [userInfo, userLoading, userError, toast]);

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
