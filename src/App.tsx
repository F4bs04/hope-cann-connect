
import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/NewProtectedRoute";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";

// Pages
import Index from "./pages/Index";
import RecuperarSenha from "./pages/RecuperarSenha";
import CadastroComplementar from "./pages/CadastroComplementar";
import PosAutenticacao from "./pages/PosAutenticacao";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import CadastroMedico from "./pages/CadastroMedico";
import CompleteRegistroMedico from "./pages/CompleteRegistroMedico";
import CadastroClinica from "./pages/CadastroClinica";
import AreaMedico from "./pages/AreaMedico";
import AreaPaciente from "./pages/AreaPaciente";
import AreaClinica from "./pages/AreaClinica";
import AreaAdmin from "./pages/AreaAdmin";
import Medicos from "./pages/Medicos";
import Tratamentos from "./pages/Tratamentos";
import Contato from "./pages/Contato";
import Agendar from "./pages/Agendar";
import NotFound from "./pages/NotFound";
import Notificacoes from "./pages/Notificacoes";
import PerfilMedico from "./pages/PerfilMedico";

function App() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Inicializando aplicação..." />;
  }

  // Redirecionamento por domínio
  if (typeof window !== 'undefined' && window.location.hostname === 'hopecann.com.br') {
    const path = window.location.pathname;
    if ((path === '/' || path === '/index' || path === '/admin') && !isAuthenticated) {
      window.location.replace('/login');
      return null;
    }
    // Adicione outros redirecionamentos conforme necessário
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/cadastro-complementar" element={<CadastroComplementar />} />
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/cadastro-medico" element={<CadastroMedico />} />
          <Route path="/complete-registro-medico" element={<CompleteRegistroMedico />} />
          <Route path="/cadastro-clinica" element={<CadastroClinica />} />
          <Route path="/recuperarsenha" element={<RecuperarSenha />} />
          <Route path="/pos-autenticacao" element={<PosAutenticacao />} />
          
          {/* Rotas protegidas */}
          <Route 
            path="/area-medico/*" 
            element={
              <ProtectedRoute allowedUserTypes={['medico']}>
                <AreaMedico />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/area-paciente/*" 
            element={
              <ProtectedRoute allowedUserTypes={['paciente']}>
                <AreaPaciente />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedUserTypes={['admin_clinica']}>
                <AreaClinica />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-panel/*" 
            element={
              <ProtectedRoute allowedUserTypes={['admin', 'admin_clinica']}>
                <AreaAdmin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agendar" 
            element={
              <ProtectedRoute allowedUserTypes={['paciente']}>
                <Agendar />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notificacoes" 
            element={
              <ProtectedRoute allowedUserTypes={['medico', 'paciente', 'admin_clinica']}>
                <Notificacoes />
              </ProtectedRoute>
            } 
          />
          
          {/* Rotas públicas */}
          <Route path="/medicos" element={<Medicos />} />
          <Route path="/medico/:id" element={<PerfilMedico />} />
          <Route path="/tratamentos" element={<Tratamentos />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
