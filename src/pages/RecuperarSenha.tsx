import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RecuperarSenha = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/pos-autenticacao`
    });
    setIsLoading(false);
    if (error) {
      toast({
        title: 'Erro ao enviar e-mail de recuperação',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6">Recuperar senha</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-hopecann-teal text-white py-2 rounded font-bold hover:bg-hopecann-teal-dark transition"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>
          {success && (
            <p className="mt-4 text-green-600 text-center">E-mail de recuperação enviado! Verifique sua caixa de entrada.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecuperarSenha;
