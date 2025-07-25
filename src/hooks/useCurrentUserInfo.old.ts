
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
        console.log('=== USER INFO DEBUG ===');
        
        // Verificar sessão do Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Supabase session:', session?.user?.email);
        console.log('Session error:', sessionError);

        // Verificar localStorage
        const localAuth = localStorage.getItem('isAuthenticated') === 'true';
        const localEmail = localStorage.getItem('userEmail');
        const localUserType = localStorage.getItem('userType');
        
        console.log('LocalStorage auth:', localAuth);
        console.log('LocalStorage email:', localEmail);
        console.log('LocalStorage userType:', localUserType);

        let userEmail = null;
        
        // Priorizar sessão do Supabase
        if (session?.user?.email) {
          userEmail = session.user.email;
          console.log('Using Supabase email:', userEmail);
        } else if (localAuth && localEmail) {
          userEmail = localEmail;
          console.log('Using localStorage email:', userEmail);
        }

        if (!userEmail) {
          console.log('No email found in session or localStorage');
          setError('No user session found');
          return;
        }

        // Buscar dados do usuário na tabela usuarios
        console.log('Searching for user with email:', userEmail);
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id, email, tipo_usuario')
          .eq('email', userEmail)
          .maybeSingle();

        console.log('User data from database:', userData);
        console.log('User query error:', userError);

        if (userError) {
          console.error('Error fetching user:', userError);
          throw userError;
        }

        if (!userData) {
          console.log('User not found in database');
          setError('User not found in database');
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

        // Buscar IDs específicos baseado no tipo de usuário
        if (userData.tipo_usuario === 'medico') {
          console.log('User is medico, searching for medico record...');
          const { data: medicoData, error: medicoError } = await supabase
            .from('medicos')
            .select('id')
            .eq('id_usuario', userData.id)
            .maybeSingle();
          
          console.log('Medico data:', medicoData);
          console.log('Medico error:', medicoError);
          
          if (medicoData) {
            info.medicoId = medicoData.id;
            console.log('Set medicoId:', medicoData.id);
          }
        } else if (userData.tipo_usuario === 'paciente') {
          console.log('User is paciente, searching for paciente record...');
          const { data: pacienteData, error: pacienteError } = await supabase
            .from('pacientes')
            .select('id')
            .eq('id_usuario', userData.id)
            .maybeSingle();
          
          console.log('Paciente data:', pacienteData);
          console.log('Paciente error:', pacienteError);
          
          if (pacienteData) {
            info.pacienteId = pacienteData.id;
          }
        }

        console.log('Final user info:', info);
        setUserInfo(info);
        setError(null);

      } catch (error: any) {
        console.error('Error loading user info:', error);
        setError(error.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  return { userInfo, loading, error };
};
