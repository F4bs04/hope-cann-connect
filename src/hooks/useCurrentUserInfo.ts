
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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('No session found');
          setLoading(false);
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id, email, tipo_usuario')
          .eq('email', session.user.email)
          .single();

        if (userError) throw userError;

        const info: UserInfo = {
          id: userData.id,
          email: userData.email,
          userType: userData.tipo_usuario,
          medicoId: null,
          pacienteId: null,
          clinicaId: null
        };

        // Buscar IDs específicos baseado no tipo de usuário
        if (userData.tipo_usuario === 'medico') {
          const { data: medicoData } = await supabase
            .from('medicos')
            .select('id')
            .eq('id_usuario', userData.id)
            .single();
          
          if (medicoData) {
            info.medicoId = medicoData.id;
          }
        } else if (userData.tipo_usuario === 'paciente') {
          const { data: pacienteData } = await supabase
            .from('pacientes')
            .select('id')
            .eq('id_usuario', userData.id)
            .single();
          
          if (pacienteData) {
            info.pacienteId = pacienteData.id;
          }
        }

        setUserInfo(info);
      } catch (error: any) {
        console.error('Error loading user info:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  return { userInfo, loading, error };
};
