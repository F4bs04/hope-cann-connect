
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Tratamentos from "./pages/Tratamentos";
import Medicos from "./pages/Medicos";
import Contato from "./pages/Contato";
import Agendar from "./pages/Agendar";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import AreaPaciente from "./pages/AreaPaciente";
import AreaMedico from "./pages/AreaMedico";
import PerfilMedico from "./pages/PerfilMedico";
import CadastroMedico from "./pages/CadastroMedico";
import NotFound from "./pages/NotFound";
import CompleteRegistroMedico from "./pages/CompleteRegistroMedico";
import CadastroClinica from "./pages/CadastroClinica";
import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AreaClinica from "./pages/AreaClinica";
import Notificacoes from "./pages/Notificacoes";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session) {
        try {
          // First check if user is a doctor
          const { data: userInfo } = await supabase
            .from('usuarios')
            .select('tipo_usuario')
            .eq('email', session.user.email)
            .maybeSingle();
            
          if (userInfo?.tipo_usuario) {
            setUserType(userInfo.tipo_usuario);
          } else {
            setUserType('paciente'); // Default
          }
        } catch (error) {
          console.error('Error fetching user type:', error);
          setUserType('paciente'); // Default on error
        }
      }
      
      setLoading(false);
    };
    
    // Check auth on load
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      
      if (session) {
        // Re-check user type on auth state change
        supabase
          .from('usuarios')
          .select('tipo_usuario')
          .eq('email', session.user.email)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.tipo_usuario) {
              setUserType(data.tipo_usuario);
            }
          })
          .then(undefined, (error) => {
            // Proper error handling with a then block for the rejected case
            console.error('Error fetching user type on auth change:', error);
          });
      } else {
        setUserType(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-hopecann-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tratamentos" element={<Tratamentos />} />
            <Route path="/medicos" element={<Medicos />} />
            <Route path="/medico/:id" element={<PerfilMedico />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/agendar" element={<Agendar />} />
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                  (userType === 'medico' ? <Navigate to="/area-medico" /> : <Navigate to="/area-paciente" />) : 
                  <Login />
              } 
            />
            <Route 
              path="/cadastro" 
              element={isAuthenticated ? <Navigate to="/" /> : <Cadastro />} 
            />
            <Route 
              path="/area-paciente" 
              element={
                <ProtectedRoute allowedUserTypes={['paciente']}>
                  <AreaPaciente />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/area-paciente/perfil" 
              element={
                <ProtectedRoute allowedUserTypes={['paciente']}>
                  <AreaPaciente initialSection="perfil" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/area-medico" 
              element={
                <ProtectedRoute allowedUserTypes={['medico']}>
                  <AreaMedico />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedUserTypes={['admin_clinica']}>
                  <AreaClinica />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notificacoes" 
              element={
                <ProtectedRoute allowedUserTypes={['paciente', 'medico', 'admin_clinica']}>
                  <Notificacoes />
                </ProtectedRoute>
              } 
            />
            <Route path="/cadastro-clinica" element={<CadastroClinica />} />
            <Route path="/cadastro-medico" element={<CadastroMedico />} />
            <Route path="/complete-registro-medico" element={<CompleteRegistroMedico />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
