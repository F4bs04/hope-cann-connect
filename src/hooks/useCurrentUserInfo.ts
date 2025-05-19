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
        console.log('[useCurrentUserInfo] Supabase session:', session);

        let userEmailForQuery: string | null = null;
        let source: string = "";

        if (session?.user?.email) {
          userEmailForQuery = session.user.email;
          source = "Supabase session";
        } else {
          console.warn('[useCurrentUserInfo] No active Supabase session. Trying localStorage.');
          userEmailForQuery = localStorage.getItem('userEmail');
          source = "localStorage";
        }

        if (!userEmailForQuery) {
          setError('No user email found in session or localStorage.');
          console.warn('[useCurrentUserInfo] No user email found in Supabase session or localStorage.');
          setUserInfo(prev => ({ ...prev, id: null, email: null, userType: null, pacienteId: null, medicoId: null, clinicaId: null }));
          setLoading(false);
          return;
        }
        
        console.log(`[useCurrentUserInfo] Using email from ${source}:`, userEmailForQuery);

        console.log('[useCurrentUserInfo] Fetching user data from usuarios table for email:', userEmailForQuery);
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id, email, tipo_usuario')
          .eq('email', userEmailForQuery)
          .single();

        if (userError) {
          console.error('[useCurrentUserInfo] Error fetching user data from usuarios table:', userError);
          setError(userError.message);
          setUserInfo(prev => ({ ...prev, id: null, email: userEmailForQuery, userType: null, pacienteId: null, medicoId: null, clinicaId: null }));
          setLoading(false);
          return;
        }
        
        if (!userData) {
          setError('User data not found in usuarios table.');
          console.warn('[useCurrentUserInfo] User data not found in usuarios table for email:', userEmailForQuery);
          setUserInfo(prev => ({ ...prev, id: null, email: userEmailForQuery, userType: null, pacienteId: null, medicoId: null, clinicaId: null }));
          setLoading(false);
          return;
        }
        console.log('[useCurrentUserInfo] UserData from usuarios table:', userData);
        
        // Ensure localStorage is updated if Supabase session was the source
        if (source === "Supabase session" && userData.email && userData.tipo_usuario) {
            localStorage.setItem('userEmail', userData.email);
            localStorage.setItem('userType', userData.tipo_usuario);
            console.log('[useCurrentUserInfo] Updated localStorage with info from Supabase session.');
        }


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
        } else if (userData.tipo_usuario === 'clinica') {
            console.log('[useCurrentUserInfo] User type is clinica. Fetching clinicaData for id_usuario:', userData.id);
            // Assuming 'clinicas' table has 'id_usuario' fk or email link. For now, let's assume it is related via email if not 'id_usuario'
             const { data: clinicaData, error: clinicaFetchError } = await supabase
              .from('clinicas') // Assuming the table name is 'clinicas'
              .select('id') 
              .eq('email', userData.email) // Or .eq('id_usuario', userData.id) if that exists
              .maybeSingle();
            
            if (clinicaFetchError) {
              console.error('[useCurrentUserInfo] Error fetching clinicaData:', clinicaFetchError);
            } else if (clinicaData) {
              info.clinicaId = clinicaData.id;
              console.log('[useCurrentUserInfo] ClinicaData found. Clinica ID set to:', clinicaData.id);
            } else {
              console.warn(`[useCurrentUserInfo] No clinica record found for user email: ${userData.email}. Clinica ID will be null.`);
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
