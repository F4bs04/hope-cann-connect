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
      console.log('[PasswordRecoveryHandler] Componente carregado');
      console.log('[PasswordRecoveryHandler] URL atual:', window.location.href);
      console.log('[PasswordRecoveryHandler] Search params:', searchParams.toString());
      
      // Verificar se é um link de recuperação de senha
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      
      console.log('[PasswordRecoveryHandler] Tokens encontrados:', {
        accessToken: accessToken ? 'presente' : 'ausente',
        refreshToken: refreshToken ? 'presente' : 'ausente',
        type: type
      });
      
      if (type === 'recovery' && accessToken && refreshToken) {
        console.log('[PasswordRecoveryHandler] Link de recuperação detectado - processando...');
        
        try {
          // Definir a sessão temporária para recuperação
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          console.log('[PasswordRecoveryHandler] Resultado setSession:', { data: !!data, error });
          
          if (error) {
            console.error('[PasswordRecoveryHandler] Erro ao definir sessão de recuperação:', error);
            navigate('/login?error=invalid_recovery_link');
            return;
          }
          
          console.log('[PasswordRecoveryHandler] Sessão definida com sucesso, redirecionando...');
          // Redirecionar para página de redefinição de senha
          navigate('/redefinir-senha', { replace: true });
          
        } catch (error) {
          console.error('[PasswordRecoveryHandler] Erro no fluxo de recuperação:', error);
          navigate('/login?error=recovery_failed');
        }
      } else {
        console.log('[PasswordRecoveryHandler] Não é um link de recuperação válido');
        // Verificar se temos tokens mas tipo diferente
        if (accessToken && refreshToken) {
          console.log('[PasswordRecoveryHandler] Tokens presentes mas tipo inválido:', type);
        }
      }
    };

    handlePasswordRecovery();
  }, [searchParams, navigate]);

  return null; // Este componente não renderiza nada
};

export default PasswordRecoveryHandler;
