import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

console.log('[main-debug.tsx] Iniciando teste simples...');

const TestApp = () => {
  console.log('[TestApp] Renderizando componente de teste...');
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#28a745', marginBottom: '20px' }}>
        ✅ React está funcionando!
      </h1>
      <p style={{ color: '#6c757d', marginBottom: '20px' }}>
        Se você consegue ver esta mensagem, o problema não é com o React.
      </p>
      <p style={{ color: '#6c757d' }}>
        Verifique o console do navegador para mais informações.
      </p>
      <button 
        onClick={() => {
          console.log('Botão clicado! React eventos funcionando.');
          alert('React está funcionando perfeitamente!');
        }}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Testar Eventos
      </button>
    </div>
  );
};

const rootElement = document.getElementById("root");
console.log('[main-debug.tsx] Root element encontrado:', !!rootElement);

if (!rootElement) {
  console.error('[main-debug.tsx] ERRO: Elemento root não encontrado!');
} else {
  try {
    console.log('[main-debug.tsx] Criando React root...');
    const root = createRoot(rootElement);
    
    console.log('[main-debug.tsx] Renderizando app de teste...');
    root.render(
      <StrictMode>
        <TestApp />
      </StrictMode>
    );
    
    console.log('[main-debug.tsx] ✅ App de teste renderizado com sucesso!');
  } catch (error) {
    console.error('[main-debug.tsx] ❌ Erro durante renderização:', error);
    
    // Fallback manual
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif; background-color: #f8d7da; color: #721c24; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <h1>❌ Erro de React</h1>
          <p>Ocorreu um erro durante a renderização do React:</p>
          <pre style="background: white; padding: 10px; border-radius: 5px; margin: 20px 0; text-align: left; max-width: 600px; overflow: auto;">${error}</pre>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Recarregar Página
          </button>
        </div>
      `;
    }
  }
}
