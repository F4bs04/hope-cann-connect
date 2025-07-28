import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Componente para interceptar e gerenciar o fluxo de recuperação de senha
 * Garante que usuários sejam direcionados para a página de redefinição ao invés de login automático
 */
const PasswordRecoveryHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handlePasswordRecovery = async () => {
      // Verificar se é um link de recuperação de senha
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      
      if (type === 'recovery' && accessToken && refreshToken) {
        console.log('[PasswordRecoveryHandler] Link de recuperação detectado');
        
        try {
          // Definir a sessão temporária para recuperação
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('Erro ao definir sessão de recuperação:', error);
            navigate('/login?error=invalid_recovery_link');
            return;
          }
          
          // Redirecionar para página de redefinição de senha
          navigate('/redefinir-senha', { replace: true });
          
        } catch (error) {
          console.error('Erro no fluxo de recuperação:', error);
          navigate('/login?error=recovery_failed');
        }
      }
    };

    handlePasswordRecovery();
  }, [searchParams, navigate]);

  return null; // Este componente não renderiza nada
};

export default PasswordRecoveryHandler;
