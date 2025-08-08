import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

/**
 * Página de callback para interceptar todos os tipos de autenticação do Supabase
 * Incluindo recuperação de senha, confirmação de email, etc.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('[AuthCallback] Processando callback de autenticação');
      console.log('[AuthCallback] URL atual:', window.location.href);
      console.log('[AuthCallback] Search params:', searchParams.toString());
      
      try {
        // Verificar se é recuperação de senha
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        console.log('[AuthCallback] Parâmetros encontrados:', {
          accessToken: accessToken ? 'presente' : 'ausente',
          refreshToken: refreshToken ? 'presente' : 'ausente',
          type,
          error: errorParam,
          errorDescription
        });

        // Se há erro nos parâmetros
        if (errorParam) {
          console.error('[AuthCallback] Erro nos parâmetros:', errorParam, errorDescription);
          setErrorMessage(errorDescription || errorParam);
          setStatus('error');
          return;
        }

        // Se é recuperação de senha
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log('[AuthCallback] Processando recuperação de senha...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          console.log('[AuthCallback] Resultado setSession:', { 
            session: !!data?.session, 
            user: !!data?.user, 
            error 
          });
          
          if (error) {
            console.error('[AuthCallback] Erro ao definir sessão:', error);
            setErrorMessage('Link de recuperação inválido ou expirado.');
            setStatus('error');
            return;
          }
          
          console.log('[AuthCallback] Sessão definida com sucesso, redirecionando...');
          setStatus('success');
          
          // Aguardar um pouco antes de redirecionar para garantir que a sessão foi estabelecida
          setTimeout(() => {
            navigate('/redefinir-senha', { replace: true });
          }, 1000);
          
          return;
        }

        // Se é confirmação de email
        if (type === 'signup' && accessToken && refreshToken) {
          console.log('[AuthCallback] Processando confirmação de email...');
          
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('[AuthCallback] Erro na confirmação:', error);
            setErrorMessage('Erro ao confirmar email.');
            setStatus('error');
            return;
          }
          
          console.log('[AuthCallback] Email confirmado, redirecionando...');
          setStatus('success');
          navigate('/pos-autenticacao', { replace: true });
          return;
        }

        // Se chegou até aqui e não processou nada específico
        if (accessToken || refreshToken || type) {
          console.log('[AuthCallback] Tipo de callback não reconhecido:', type);
          setErrorMessage('Tipo de autenticação não reconhecido.');
          setStatus('error');
        } else {
          console.log('[AuthCallback] Nenhum parâmetro de autenticação encontrado');
          setErrorMessage('Link inválido ou expirado.');
          setStatus('error');
        }
        
      } catch (error) {
        console.error('[AuthCallback] Erro inesperado:', error);
        setErrorMessage('Erro inesperado ao processar autenticação.');
        setStatus('error');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return <LoadingScreen message="Processando autenticação..." />;
  }

  if (status === 'success') {
    return <LoadingScreen message="Autenticação bem-sucedida! Redirecionando..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            Erro de Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {errorMessage || 'Ocorreu um erro ao processar sua solicitação.'}
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/recuperarsenha')}
              className="w-full"
            >
              Solicitar novo link
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Voltar ao login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;