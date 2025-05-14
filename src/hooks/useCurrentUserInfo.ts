
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
      setLoading(true); // Ensure loading is true at the start
      setError(null); // Reset error
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('No session found');
          setUserInfo(prev => ({ ...prev, id: null, email: null, userType: null, pacienteId: null, medicoId: null, clinicaId: null }));
          setLoading(false);
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id, email, tipo_usuario')
          .eq('email', session.user.email)
          .single(); // Assuming email in usuarios is unique and user must exist if session does

        if (userError) {
          console.error('Error fetching user data from usuarios table:', userError);
          setError(userError.message);
          setUserInfo(prev => ({ ...prev, id: null, email: session.user.email, userType: null, pacienteId: null, medicoId: null, clinicaId: null }));
          setLoading(false);
          return;
        }
        
        if (!userData) {
          setError('User data not found in usuarios table.');
          setUserInfo(prev => ({ ...prev, id: null, email: session.user.email, userType: null, pacienteId: null, medicoId: null, clinicaId: null }));
          setLoading(false);
          return;
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
          const { data: medicoData, error: medicoFetchError } = await supabase
            .from('medicos')
            .select('id')
            .eq('id_usuario', userData.id)
            .maybeSingle(); // Use maybeSingle for safety
          
          if (medicoFetchError) {
            console.error('Error fetching medicoData in useCurrentUserInfo:', medicoFetchError);
            // Continue, medicoId will remain null
          } else if (medicoData) {
            info.medicoId = medicoData.id;
          } else {
            console.warn(`No medico record found for id_usuario: ${userData.id} in useCurrentUserInfo`);
          }
        } else if (userData.tipo_usuario === 'paciente') {
          const { data: pacienteData, error: pacienteFetchError } = await supabase
            .from('pacientes')
            .select('id')
            .eq('id_usuario', userData.id)
            .maybeSingle(); // Changed from .single() to .maybeSingle()
          
          if (pacienteFetchError) {
            console.error('Error fetching pacienteData in useCurrentUserInfo:', pacienteFetchError);
            // An error occurred during fetch, info.pacienteId remains null
          } else if (pacienteData) {
            info.pacienteId = pacienteData.id;
          } else {
            // No error, but no patient record found for this user's id_usuario
            console.warn(`No paciente record found for id_usuario: ${userData.id} in useCurrentUserInfo. Paciente ID will be null.`);
          }
        }

        setUserInfo(info);
      } catch (error: any) {
        console.error('Error loading user info in useCurrentUserInfo:', error);
        setError(error.message);
         setUserInfo(prev => ({ ...prev, id: null, email: prev.email, userType: null, pacienteId: null, medicoId: null, clinicaId: null }));
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  return { userInfo, loading, error };
};
