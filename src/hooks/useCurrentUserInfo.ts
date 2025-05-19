
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
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[useCurrentUserInfo] Session:', session);
        if (!session) {
          setError('No session found');
          console.warn('[useCurrentUserInfo] No session found.');
          setUserInfo(prev => ({ ...prev, id: null, email: null, userType: null, pacienteId: null, medicoId: null, clinicaId: null }));
          setLoading(false);
          return;
        }

        console.log('[useCurrentUserInfo] Fetching user data from usuarios table for email:', session.user.email);
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id, email, tipo_usuario')
          .eq('email', session.user.email)
          .single(); 

        if (userError) {
          console.error('[useCurrentUserInfo] Error fetching user data from usuarios table:', userError);
          setError(userError.message);
          setUserInfo(prev => ({ ...prev, id: null, email: session.user.email, userType: null, pacienteId: null, medicoId: null, clinicaId: null }));
          setLoading(false);
          return;
        }
        
        if (!userData) {
          setError('User data not found in usuarios table.');
          console.warn('[useCurrentUserInfo] User data not found in usuarios table for email:', session.user.email);
          setUserInfo(prev => ({ ...prev, id: null, email: session.user.email, userType: null, pacienteId: null, medicoId: null, clinicaId: null }));
          setLoading(false);
          return;
        }
        console.log('[useCurrentUserInfo] UserData from usuarios table:', userData);

        const info: UserInfo = {
          id: userData.id,
          email: userData.email,
          userType: userData.tipo_usuario,
          medicoId: null,
          pacienteId: null,
          clinicaId: null
        };

        if (userData.tipo_usuario === 'medico') {
          console.log('[useCurrentUserInfo] User type is medico. Fetching medicoData for id_usuario:', userData.id);
          const { data: medicoData, error: medicoFetchError } = await supabase
            .from('medicos')
            .select('id')
            .eq('id_usuario', userData.id)
            .maybeSingle(); 
          
          if (medicoFetchError) {
            console.error('[useCurrentUserInfo] Error fetching medicoData:', medicoFetchError);
          } else if (medicoData) {
            info.medicoId = medicoData.id;
            console.log('[useCurrentUserInfo] MedicoData found. Medico ID set to:', medicoData.id);
          } else {
            console.warn(`[useCurrentUserInfo] No medico record found for id_usuario: ${userData.id}. Medico ID will be null.`);
          }
        } else if (userData.tipo_usuario === 'paciente') {
          console.log('[useCurrentUserInfo] User type is paciente. Fetching pacienteData for id_usuario:', userData.id);
          const { data: pacienteData, error: pacienteFetchError } = await supabase
            .from('pacientes')
            .select('id')
            .eq('id_usuario', userData.id)
            .maybeSingle(); 
          
          if (pacienteFetchError) {
            console.error('[useCurrentUserInfo] Error fetching pacienteData:', pacienteFetchError);
          } else if (pacienteData) {
            info.pacienteId = pacienteData.id;
            console.log('[useCurrentUserInfo] PacienteData found. Paciente ID set to:', pacienteData.id);
          } else {
            console.warn(`[useCurrentUserInfo] No paciente record found for id_usuario: ${userData.id}. Paciente ID will be null.`);
          }
        }

        console.log('[useCurrentUserInfo] Final userInfo object:', info);
        setUserInfo(info);
      } catch (error: any) {
        console.error('[useCurrentUserInfo] General error loading user info:', error);
        setError(error.message);
         setUserInfo(prev => ({ ...prev, id: null, email: prev.email, userType: null, pacienteId: null, medicoId: null, clinicaId: null }));
      } finally {
        setLoading(false);
        console.log('[useCurrentUserInfo] Finished loading user info. Loading state:', false);
      }
    };

    loadUserInfo();
  }, []);

  return { userInfo, loading, error };
};
