
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface UserInfo {
  id: number | null;
  medicoId?: number | null;
  pacienteId?: number | null;
  clinicaId?: number | null;
  email: string | null;
  userType: string | null;
}

export const useCurrentUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: null,
    medicoId: null,
    pacienteId: null,
    clinicaId: null,
    email: null,
    userType: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      console.log('[useCurrentUserInfo] Starting to load user info...');
      setLoading(true);
      setError(null);
      
      try {
        // Primeiro, verificar se temos informações de login no localStorage
        const localStorageEmail = localStorage.getItem('userEmail');
        const localStorageUserType = localStorage.getItem('userType');
        const localStorageUserId = localStorage.getItem('userId');
        const localStorageMedicoId = localStorage.getItem('medicoId');
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        console.log('[useCurrentUserInfo] Dados do localStorage:', { 
          email: localStorageEmail, 
          userType: localStorageUserType, 
          userId: localStorageUserId,
          medicoId: localStorageMedicoId,
          isAuthenticated 
        });

        // Se não estiver autenticado pelo localStorage, tentar obter a sessão do Supabase
        if (!isAuthenticated) {
          console.log('[useCurrentUserInfo] Sem autenticação no localStorage, verificando sessão do Supabase');
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session?.user?.email) {
            console.warn('[useCurrentUserInfo] Nenhuma sessão ativa do Supabase encontrada e sem autenticação no localStorage.');
            setUserInfo(prev => ({ ...prev, id: null, email: null, userType: null, pacienteId: null, medicoId: null, clinicaId: null }));
            setLoading(false);
            return;
          }
          
          console.log('[useCurrentUserInfo] Sessão do Supabase encontrada para:', session.user.email);
          // Verificar se este email existe na tabela de usuários
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('id, email, tipo_usuario')
            .eq('email', session.user.email)
            .maybeSingle();
            
          if (userError || !userData) {
            console.error('[useCurrentUserInfo] Não foi possível encontrar usuário na tabela usuarios para o email da sessão:', session.user.email);
            setUserInfo(prev => ({ ...prev, id: null, email: session.user.email, userType: null }));
            setLoading(false);
            return;
          }
          
          // Armazenar no localStorage para usos futuros
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('userId', userData.id.toString());
          localStorage.setItem('userType', userData.tipo_usuario);
          localStorage.setItem('authTimestamp', Date.now().toString());
          
          // Continuar com o email do usuário encontrado
          return await processUserData(userData.id, userData.email, userData.tipo_usuario);
        }
        
        // Se temos email e tipo no localStorage, usar esses dados
        if (localStorageEmail && localStorageUserType && localStorageUserId) {
          console.log('[useCurrentUserInfo] Usando dados do localStorage para processar informações do usuário');
          
          // Se já temos medicoId no localStorage e o usuário é médico, podemos retornar imediatamente
          if (localStorageUserType === 'medico' && localStorageMedicoId) {
            console.log('[useCurrentUserInfo] Usando medicoId do localStorage:', localStorageMedicoId);
            setUserInfo({
              id: Number(localStorageUserId),
              email: localStorageEmail,
              userType: localStorageUserType,
              medicoId: Number(localStorageMedicoId),
              pacienteId: null,
              clinicaId: null
            });
            setLoading(false);
            return;
          }
          
          return await processUserData(
            Number(localStorageUserId), 
            localStorageEmail, 
            localStorageUserType
          );
        }
        
        // Se chegamos aqui, não temos nem sessão do Supabase nem dados válidos no localStorage
        console.warn('[useCurrentUserInfo] Não foi possível obter informações do usuário de nenhuma fonte.');
        setUserInfo(prev => ({ ...prev, id: null, email: null, userType: null, pacienteId: null, medicoId: null, clinicaId: null }));
        setError('Não foi possível obter informações do usuário. Faça login novamente.');
      } catch (error: any) {
        console.error('[useCurrentUserInfo] General error loading user info:', error);
        setError(error.message);
        setUserInfo(prev => ({ ...prev, id: null, email: prev.email, userType: null, pacienteId: null, medicoId: null, clinicaId: null }));
      } finally {
        setLoading(false);
        console.log('[useCurrentUserInfo] Finished loading user info. Loading state:', false);
      }
    };

    // Função auxiliar para processar os dados do usuário baseado no tipo
    const processUserData = async (userId: number, email: string, userType: string) => {
      console.log('[useCurrentUserInfo] Processando dados do usuário:', { userId, email, userType });
      
      const info: UserInfo = {
        id: userId,
        email: email,
        userType: userType,
        medicoId: null,
        pacienteId: null,
        clinicaId: null
      };

      if (userType === 'medico') {
        console.log('[useCurrentUserInfo] User type is medico. Fetching medicoData for id_usuario:', userId);
        const { data: medicoData, error: medicoFetchError } = await supabase
          .from('medicos')
          .select('id')
          .eq('id_usuario', userId)
          .maybeSingle();
        
        if (medicoFetchError) {
          console.error('[useCurrentUserInfo] Error fetching medicoData:', medicoFetchError);
        } else if (medicoData) {
          info.medicoId = medicoData.id;
          console.log('[useCurrentUserInfo] MedicoData found. Medico ID set to:', medicoData.id);
          // Armazenar no localStorage para usos futuros
          localStorage.setItem('medicoId', medicoData.id.toString());
        } else {
          console.warn(`[useCurrentUserInfo] No medico record found for id_usuario: ${userId}. Medico ID will be null.`);
        }
      } else if (userType === 'paciente') {
        console.log('[useCurrentUserInfo] User type is paciente. Fetching pacienteData for id_usuario:', userId);
        const { data: pacienteData, error: pacienteFetchError } = await supabase
          .from('pacientes')
          .select('id')
          .eq('id_usuario', userId)
          .maybeSingle(); 
        
        if (pacienteFetchError) {
          console.error('[useCurrentUserInfo] Error fetching pacienteData:', pacienteFetchError);
        } else if (pacienteData) {
          info.pacienteId = pacienteData.id;
          console.log('[useCurrentUserInfo] PacienteData found. Paciente ID set to:', pacienteData.id);
        } else {
          console.warn(`[useCurrentUserInfo] No paciente record found for id_usuario: ${userId}. Paciente ID will be null.`);
        }
      } else if (userType === 'clinica' || userType === 'admin_clinica') {
          console.log('[useCurrentUserInfo] User type is clinica. Fetching clinicaData for email:', email);
          const { data: clinicaData, error: clinicaFetchError } = await supabase
            .from('clinicas') 
            .select('id') 
            .eq('email', email)
            .maybeSingle();
          
          if (clinicaFetchError) {
            console.error('[useCurrentUserInfo] Error fetching clinicaData:', clinicaFetchError);
          } else if (clinicaData) {
            info.clinicaId = clinicaData.id;
            console.log('[useCurrentUserInfo] ClinicaData found. Clinica ID set to:', clinicaData.id);
          } else {
            console.warn(`[useCurrentUserInfo] No clinica record found for user email: ${email}. Clinica ID will be null.`);
          }
      }

      console.log('[useCurrentUserInfo] Final userInfo object:', info);
      setUserInfo(info);
    };

    loadUserInfo();
  }, []);

  return { userInfo, loading, error };
};
