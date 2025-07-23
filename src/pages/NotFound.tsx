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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="mb-6">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-foreground/80 mb-4">Página não encontrada</h2>
          <p className="text-muted-foreground mb-6">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleGoHome}
            className="w-full"
            size="lg"
          >
            <Home className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Você será redirecionado automaticamente em alguns segundos...
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
