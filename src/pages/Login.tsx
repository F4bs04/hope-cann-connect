
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Erro ao fazer login com Google",
        description: error.message || "Ocorreu um erro ao fazer login com Google. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.provider_token) {
        const user = session.user;
        if (user) {
          setUserAvatar(user.user_metadata.avatar_url);
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();

          if (userError) {
            const { data: newUser, error: createError } = await supabase
              .from('usuarios')
              .insert([{
                email: user.email,
                senha: '',
                tipo_usuario: 'paciente',
                ultimo_acesso: new Date().toISOString()
              }])
              .select()
              .single();

            if (createError) throw createError;

            if (newUser) {
              await supabase.from('pacientes').insert([{
                id_usuario: newUser.id,
                nome: user.user_metadata.full_name || user.email?.split('@')[0] || '',
                cpf: '',
                data_nascimento: new Date('2000-01-01').toISOString(),
                endereco: '',
                telefone: '',
                email: user.email || ''
              }]);

              localStorage.setItem('isAuthenticated', 'true');
              localStorage.setItem('userEmail', user.email || '');
              localStorage.setItem('userId', newUser.id.toString());
              localStorage.setItem('userType', 'paciente');
              localStorage.setItem('userAvatar', user.user_metadata.avatar_url || '');
              localStorage.setItem('authTimestamp', Date.now().toString());

              toast({
                title: "Conta criada com sucesso",
                description: "Bem-vindo ao sistema! Por favor, complete seu perfil."
              });
              navigate('/area-paciente');
            }
          } else {
            await supabase
              .from('usuarios')
              .update({ ultimo_acesso: new Date().toISOString() })
              .eq('id', userData.id);

            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', user.email || '');
            localStorage.setItem('userId', userData.id.toString());
            localStorage.setItem('userType', userData.tipo_usuario);
            localStorage.setItem('userAvatar', user.user_metadata.avatar_url || '');
            localStorage.setItem('authTimestamp', Date.now().toString());

            toast({
              title: "Login bem-sucedido",
              description: "Bem-vindo de volta ao sistema!"
            });

            switch (userData.tipo_usuario) {
              case 'medico':
                navigate('/area-medico');
                break;
              case 'paciente':
                navigate('/area-paciente');
                break;
              case 'admin_clinica':
                navigate('/admin');
                break;
              default:
                navigate('/area-paciente');
            }
          }
        }
      }
      setGoogleLoading(false);
    };

    checkSession();
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
