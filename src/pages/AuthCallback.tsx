import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing OAuth callback...');
        
        // Verificar se há erro nos parâmetros da URL
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          throw new Error(errorDescription || 'Erro na autenticação OAuth');
        }

        // Processar a sessão OAuth
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          throw error;
        }

        if (!data.session) {
          throw new Error('Nenhuma sessão encontrada após callback OAuth');
        }

        const user = data.session.user;
        console.log('Usuário OAuth:', user);

        // Verificar se o usuário já existe no sistema
        const { data: existingUser, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        if (userError && userError.code !== 'PGRST116') {
          console.error('Erro ao verificar usuário:', userError);
          throw userError;
        }

        if (!existingUser) {
          // Criar novo usuário se não existir
          const { data: newUser, error: createError } = await supabase
            .from('usuarios')
            .insert([
              {
                email: user.email,
                nome: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
                tipo_usuario: 'paciente', // Default para paciente
                ativo: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select()
            .single();

          if (createError) {
            console.error('Erro ao criar usuário:', createError);
            throw createError;
          }

          // Criar perfil de paciente para o novo usuário
          const { error: pacienteError } = await supabase
            .from('pacientes')
            .insert([
              {
                id_usuario: newUser.id,
                nome: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
                email: user.email,
                telefone: '',
                data_nascimento: null,
                endereco: '',
                genero: '',
                condicao_medica: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);

          if (pacienteError) {
            console.error('Erro ao criar perfil de paciente:', pacienteError);
            // Não falhar aqui, apenas logar o erro
          }

          toast({
            title: "Bem-vindo!",
            description: "Sua conta foi criada com sucesso. Complete seu perfil na área do paciente.",
          });
        } else {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta!",
          });
        }

        // Redirecionar baseado no tipo de usuário
        const userType = existingUser?.tipo_usuario || 'paciente';
        const redirectPath = userType === 'medico' ? '/area-medico' :
                           userType === 'admin_clinica' ? '/admin' : '/area-paciente';

        navigate(redirectPath, { replace: true });

      } catch (error: any) {
        console.error('Erro no callback OAuth:', error);
        setError(error.message || 'Erro desconhecido durante a autenticação');
        
        toast({
          title: "Erro na autenticação",
          description: error.message || "Ocorreu um erro durante o login com Google. Tente novamente.",
          variant: "destructive"
        });

        // Redirecionar para login após erro
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, toast]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro na Autenticação</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <p className="text-xs text-gray-400">Redirecionando para a página de login...</p>
        </div>
      </div>
    );
  }

  return (
    <LoadingScreen message="Processando autenticação..." />
  );
};

export default AuthCallback;
