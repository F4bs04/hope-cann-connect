import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CadastroComplementar = () => {
  const [nome, setNome] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('paciente');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuário não autenticado');
      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: nome,
        role: tipoUsuario
      });
      if (error) throw error;
      toast({ title: 'Cadastro complementar realizado com sucesso!' });
      window.location.replace('/');
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar cadastro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm text-center">
          <h1 className="text-2xl font-bold mb-4">Complete seu cadastro</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              placeholder="Nome completo"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
            <select
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              value={tipoUsuario}
              onChange={e => setTipoUsuario(e.target.value)}
            >
              <option value="paciente">Paciente</option>
              <option value="medico">Médico</option>
            </select>
            <button
              type="submit"
              className="w-full bg-hopecann-teal text-white py-2 rounded font-bold hover:bg-hopecann-teal-dark transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar cadastro'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CadastroComplementar;
