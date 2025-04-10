
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Gerar um CAPTCHA simples (apenas para demonstração)
  React.useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    setCaptchaValue(`${num1} + ${num2} = ?`);
    setCaptchaAnswer((num1 + num2).toString());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validar CAPTCHA
    if (userCaptchaInput !== captchaAnswer) {
      setError('CAPTCHA incorreto');
      setIsLoading(false);
      generateCaptcha();
      return;
    }

    // Simulação de login (em um app real, isso seria uma chamada à API)
    setTimeout(() => {
      // Aqui seria a lógica real de autenticação
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo à área do paciente!",
      });
      
      // Redirecionar para a área do paciente
      navigate('/area-paciente');
      setIsLoading(false);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    
    // Simulação de login com Google (em um app real, isso usaria OAuth)
    setTimeout(() => {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', 'usuario@gmail.com');
      
      toast({
        title: "Login com Google bem-sucedido",
        description: "Bem-vindo à área do paciente!",
      });
      
      navigate('/area-paciente');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6">Acesse sua conta</h1>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="captcha">CAPTCHA</Label>
              <div className="bg-gray-100 p-3 rounded-md text-center font-semibold mb-2">
                {captchaValue}
              </div>
              <Input
                id="captcha"
                type="text"
                placeholder="Digite a resposta"
                value={userCaptchaInput}
                onChange={(e) => setUserCaptchaInput(e.target.value)}
                required
              />
              <button
                type="button"
                className="text-sm text-hopecann-teal hover:underline"
                onClick={generateCaptcha}
              >
                Gerar novo CAPTCHA
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer">
                Lembrar de mim
              </Label>
            </div>
            
            <Button type="submit" className="w-full bg-hopecann-teal hover:bg-hopecann-teal/90" disabled={isLoading}>
              {isLoading ? "Processando..." : "Entrar"}
            </Button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">ou continue com</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 mb-4"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5453 6.5H8.5V9.5H12.6039C12.0442 11.3 10.4228 12.5 8.5 12.5C6.01614 12.5 4 10.4839 4 8C4 5.51614 6.01614 3.5 8.5 3.5C9.56267 3.5 10.5392 3.88194 11.3193 4.5H14.3283C12.9325 2.38305 10.8553 1 8.5 1C4.63396 1 1.5 4.13396 1.5 8C1.5 11.866 4.63396 15 8.5 15C12.3667 15 15 12.3667 15 8.5C15 7.83193 14.7726 7.15722 14.5453 6.5H15.5453Z" fill="#4285F4"/>
            </svg>
            Google
          </Button>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <a href="#" className="text-hopecann-teal hover:underline">
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
