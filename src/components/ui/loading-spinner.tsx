
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn(
      "animate-spin rounded-full border-2 border-muted border-t-primary",
      sizes[size],
      className
    )} />
  );
}

interface LoadingScreenProps {
  message?: string;
  timeout?: number;
}

export function LoadingScreen({ message = "Carregando...", timeout = 10000 }: LoadingScreenProps) {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground text-center">{message}</p>
      
      {showTimeout && (
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            O carregamento está demorando mais que o esperado...
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleReload}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Recarregar
            </button>
            <button
              onClick={handleGoHome}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Ir para Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
