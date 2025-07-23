
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoginForm } from '@/components/auth/LoginForm';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { useLoginForm } from '@/hooks/useLoginForm';

const Login = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { form, isLoading, authError, handleLogin } = useLoginForm();

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        console.error("Google OAuth error:", error);
        throw error;
      }
      
      console.log("Google OAuth iniciado:", data);
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Erro ao fazer login com Google",
        description: error.message || "Ocorreu um erro ao fazer login com Google. Verifique se o provedor Google está configurado corretamente.",
        variant: "destructive"
      });
      setGoogleLoading(false);
    }
  };

  // Configurar listener para mudanças de auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Login] Auth state change:", event, session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await handleSuccessfulAuth(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSuccessfulAuth = async (user: any) => {
    try {
      // Verificar se o usuário já existe
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') {
        console.error("Erro ao buscar usuário:", userError);
        throw userError;
      }

      let finalUserData = userData;

      // Se usuário não existe, criar conta
      if (!userData) {
        console.log("Criando novo usuário para:", user.email);
        
        const { data: newUser, error: createError } = await supabase
          .from('usuarios')
          .insert([{
            email: user.email,
            tipo_usuario: 'paciente',
            ultimo_acesso: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error("Erro ao criar usuário:", createError);
          throw createError;
        }

        // Criar perfil de paciente
        const { error: pacienteError } = await supabase
          .from('pacientes')
          .insert([{
            id_usuario: newUser.id,
            nome: user.user_metadata.full_name || user.email?.split('@')[0] || '',
            email: user.email || '',
            cpf: '',
            data_nascimento: '2000-01-01',
            endereco: '',
            telefone: ''
          }]);

        if (pacienteError) {
          console.error("Erro ao criar perfil de paciente:", pacienteError);
        }

        finalUserData = newUser;
        
        toast({
          title: "Conta criada com sucesso",
          description: "Bem-vindo ao HopeCann! Complete seu perfil."
        });
      } else {
        // Atualizar último acesso
        await supabase
          .from('usuarios')
          .update({ ultimo_acesso: new Date().toISOString() })
          .eq('id', userData.id);

        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta ao HopeCann!"
        });
      }

      // Salvar dados de autenticação
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', user.email || '');
      localStorage.setItem('userId', finalUserData!.id.toString());
      localStorage.setItem('userType', finalUserData!.tipo_usuario);
      localStorage.setItem('authTimestamp', Date.now().toString());
      
      if (user.user_metadata?.avatar_url) {
        localStorage.setItem('userAvatar', user.user_metadata.avatar_url);
        setUserAvatar(user.user_metadata.avatar_url);
      }

      // Redirecionar baseado no tipo de usuário
      const userType = finalUserData!.tipo_usuario;
      switch (userType) {
        case 'medico':
          navigate('/area-medico', { replace: true });
          break;
        case 'paciente':
          navigate('/area-paciente', { replace: true });
          break;
        case 'admin_clinica':
          navigate('/admin', { replace: true });
          break;
        default:
          navigate('/area-paciente', { replace: true });
      }
    } catch (error: any) {
      console.error("Erro no handleSuccessfulAuth:", error);
      toast({
        title: "Erro na autenticação",
        description: error.message || "Ocorreu um erro durante a autenticação.",
        variant: "destructive"
      });
    }
  };

  // Verificar se já está logado no carregamento da página
  useEffect(() => {
    const checkExistingAuth = async () => {
      // Verificar autenticação local
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const userType = localStorage.getItem('userType');
      const authTimestamp = localStorage.getItem('authTimestamp');
      
      if (isAuthenticated && authTimestamp) {
        const timestamp = parseInt(authTimestamp);
        const authAgeDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        
        if (authAgeDays <= 1) {
          // Redirecionar se já autenticado
          switch (userType) {
            case 'medico':
              navigate('/area-medico', { replace: true });
              return;
            case 'paciente':
              navigate('/area-paciente', { replace: true });
              return;
            case 'admin_clinica':
              navigate('/admin', { replace: true });
              return;
            default:
              navigate('/area-paciente', { replace: true });
              return;
          }
        } else {
          // Limpar autenticação expirada
          ['isAuthenticated', 'userEmail', 'userId', 'userType', 'authTimestamp', 'userAvatar']
            .forEach(key => localStorage.removeItem(key));
        }
      }

      // Verificar sessão do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handleSuccessfulAuth(session.user);
      }
    };

    checkExistingAuth();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6">Acesse sua conta</h1>
          
          {userAvatar && (
            <div className="flex justify-center mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userAvatar} alt="User avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          )}
          
          <LoginForm 
            form={form}
            onSubmit={handleLogin}
            isLoading={isLoading}
            authError={authError}
          />
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">ou continue com</span>
            </div>
          </div>
          
          <GoogleLoginButton 
            onClick={handleGoogleLogin}
            isLoading={googleLoading}
          />
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <a href="/cadastro" className="text-hopecann-teal hover:underline">
                Cadastre-se
              </a>
            </p>
            <a href="#" className="text-sm text-hopecann-teal hover:underline mt-2 inline-block">
              Esqueceu sua senha?
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
