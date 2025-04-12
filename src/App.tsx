import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import React from "react";

// Create the query client
const queryClient = new QueryClient();

// Define App as a function component
function App() {
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
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/area-paciente" element={<AreaPaciente />} />
            <Route path="/area-medico" element={<AreaMedico />} />
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
