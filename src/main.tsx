import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "@/components/providers/AppProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import App from "./App.tsx";
import "./index.css";

console.log('[main.tsx] Iniciando aplicação...');
console.log('[main.tsx] Document ready state:', document.readyState);

const rootElement = document.getElementById("root");
console.log('[main.tsx] Root element found:', !!rootElement);

if (!rootElement) {
  console.error('[main.tsx] Root element not found!');
  throw new Error('Root element not found');
}

try {
  console.log('[main.tsx] Creating React root...');
  const root = createRoot(rootElement);
  
  console.log('[main.tsx] Rendering app...');
  root.render(
    <StrictMode>
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    </StrictMode>
  );
  
  console.log('[main.tsx] App rendered successfully!');
} catch (error) {
  console.error('[main.tsx] Error during initialization:', error);
  
  // Fallback para mostrar erro na tela
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h1 style="color: #dc3545;">Erro de Inicialização</h1>
      <p>Ocorreu um erro ao inicializar a aplicação.</p>
      <details style="margin-top: 16px; text-align: left;">
        <summary>Detalhes do erro</summary>
        <pre style="margin-top: 8px; padding: 8px; background: #f1f3f4; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; overflow: auto;">${error}</pre>
      </details>
      <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Recarregar
      </button>
    </div>
  `;
}
