import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

console.log('[test-main.tsx] Teste de renderização simples');

const SimpleApp = () => {
  console.log('[SimpleApp] Renderizando...');
  return (
    <div style={{ 
      padding: '20px', 
      fontSize: '18px', 
      textAlign: 'center',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🎉 Teste de Renderização
      </h1>
      <p style={{ color: '#666', marginBottom: '10px' }}>
        Se você conseguir ver esta mensagem, o React está funcionando!
      </p>
      <p style={{ color: '#666' }}>
        Verifique o console para logs de debug.
      </p>
    </div>
  );
};

const rootElement = document.getElementById("root");
console.log('[test-main.tsx] Root element found:', !!rootElement);

if (!rootElement) {
  console.error('[test-main.tsx] Root element not found!');
} else {
  try {
    console.log('[test-main.tsx] Creating React root...');
    const root = createRoot(rootElement);
    
    console.log('[test-main.tsx] Rendering simple app...');
    root.render(
      <StrictMode>
        <SimpleApp />
      </StrictMode>
    );
    
    console.log('[test-main.tsx] Simple app rendered successfully!');
  } catch (error) {
    console.error('[test-main.tsx] Error during rendering:', error);
  }
}
