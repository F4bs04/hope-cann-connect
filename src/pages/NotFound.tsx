import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Auto-redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, [location.pathname, navigate]);

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm text-center">
          <h1 className="text-3xl font-bold mb-4 text-hopecann-teal">Página não encontrada</h1>
          <p className="text-gray-700 mb-6">A página que você tentou acessar não existe ou foi movida.</p>
          <button
            className="bg-hopecann-teal text-white px-6 py-2 rounded font-bold hover:bg-hopecann-teal-dark transition"
            onClick={() => navigate('/')}
          >
            Voltar para a página inicial
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
