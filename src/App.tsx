import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppLayout } from "@/components/layout/AppLayout";
import { HubLayout } from "@/components/layout/HubLayout";

import Login from "./pages/auth/Login";
import SelecaoPerfil from "./pages/auth/SelecaoPerfil";
import NotFound from "./pages/NotFound";
import Stub from "./pages/Stub";

import AdminDashboard from "./pages/admin/Dashboard";
import Empresas from "./pages/admin/Empresas";
import AtracaoLista from "./pages/admin/AtracaoLista";
import VagaDetalheAdmin from "./pages/admin/VagaDetalhe";
import Analytics from "./pages/admin/Analytics";
import GestaoConta from "./pages/admin/GestaoConta";
import HorasPage from "./pages/admin/HorasPage";
import ProjetosPage from "./pages/admin/ProjetosPage";

import ClienteDashboard from "./pages/cliente/ClienteDashboard";
import VagaDetalheCliente from "./pages/cliente/VagaDetalheCliente";

import LiderPainel from "./pages/hub/LiderPainel";
import ColaboradorInicio from "./pages/hub/ColaboradorInicio";
import CeoDashboard from "./pages/hub/CeoDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/selecao-perfil" element={<SelecaoPerfil />} />

          {/* Admin / Consultor */}
          <Route element={<AppLayout variant="admin" />}>
            <Route path="/app/dashboard" element={<AdminDashboard />} />
            <Route path="/app/empresas" element={<Empresas />} />
            <Route path="/app/empresas/:id" element={<Stub title="Detalhe da empresa" subtitle="Visão geral, vagas, projetos, horas, boletos, contratos, usuários" />} />
            <Route path="/app/usuarios" element={<Stub title="Usuários" subtitle="Gestão de usuários internos e externos" />} />
            <Route path="/app/projetos" element={<ProjetosPage />} />
            <Route path="/app/projetos/:id" element={<Stub title="Detalhe do projeto" subtitle="Briefing, entregáveis, timer, NPS" />} />
            <Route path="/app/horas" element={<HorasPage />} />
            <Route path="/app/solicitacoes" element={<Stub title="Solicitações" subtitle="Central de solicitações" />} />
            <Route path="/app/solicitacoes/:id" element={<Stub title="Detalhe da solicitação" />} />
            <Route path="/app/atracao" element={<AtracaoLista />} />
            <Route path="/app/atracao/:id" element={<VagaDetalheAdmin />} />
            <Route path="/app/candidatos/:id" element={<Stub title="Perfil do candidato" subtitle="DISC, questionários, pareceres" />} />
            <Route path="/app/analytics" element={<Analytics />} />
            <Route path="/app/gestao-de-conta" element={<GestaoConta />} />
            <Route path="/app/comunicados" element={<Stub title="Comunicados" subtitle="Criar, segmentar e rastrear leitura" />} />
            <Route path="/app/calendario" element={<Stub title="Calendário" />} />
            <Route path="/app/documentos" element={<Stub title="Documentos" subtitle="Biblioteca de documentos" />} />
            <Route path="/app/auditoria" element={<Stub title="Auditoria" subtitle="Log completo de ações" />} />
            <Route path="/app/configuracoes" element={<Stub title="Configurações" />} />
          </Route>

          {/* Cliente ADM */}
          <Route element={<AppLayout variant="cliente" />}>
            <Route path="/cliente/dashboard" element={<ClienteDashboard />} />
            <Route path="/cliente/projetos" element={<Stub title="Projetos da empresa" />} />
            <Route path="/cliente/projetos/:id" element={<Stub title="Detalhe do projeto" subtitle="Entregáveis + timer consultor + NPS" />} />
            <Route path="/cliente/horas" element={<Stub title="Horas consumidas" />} />
            <Route path="/cliente/solicitacoes" element={<Stub title="Minhas solicitações" />} />
            <Route path="/cliente/atracao" element={<Stub title="Minhas vagas" subtitle="Solicite ou acompanhe vagas em andamento" />} />
            <Route path="/cliente/atracao/:id" element={<VagaDetalheCliente />} />
            <Route path="/cliente/gestao-conta" element={<Stub title="Gestão de conta" subtitle="Boletos, contratos, relatórios" />} />
            <Route path="/cliente/comunicados" element={<Stub title="Comunicados recebidos" />} />
            <Route path="/cliente/calendario" element={<Stub title="Calendário" />} />
            <Route path="/cliente/documentos" element={<Stub title="Documentos da empresa" />} />
            <Route path="/cliente/guia" element={<Stub title="Guia / FAQ" />} />
          </Route>

          {/* Hub Líder */}
          <Route element={<HubLayout profile="lider" />}>
            <Route path="/hub/lider/painel" element={<LiderPainel />} />
            <Route path="/hub/lider/meu-time" element={<Stub title="Meu time" />} />
            <Route path="/hub/lider/meu-time/:id" element={<Stub title="Perfil do colaborador" />} />
            <Route path="/hub/lider/onboarding" element={<Stub title="Onboarding" />} />
            <Route path="/hub/lider/feedback" element={<Stub title="Feedback" />} />
            <Route path="/hub/lider/avaliacoes" element={<Stub title="Avaliação de desempenho" />} />
            <Route path="/hub/lider/solicitacoes" element={<Stub title="Solicitações do time" />} />
            <Route path="/hub/lider/politicas" element={<Stub title="Políticas internas" />} />
            <Route path="/hub/lider/treinamentos" element={<Stub title="Treinamentos" />} />
            <Route path="/hub/lider/calendario" element={<Stub title="Calendário da equipe" />} />
            <Route path="/hub/lider/comunicados" element={<Stub title="Comunicados para a equipe" />} />
          </Route>

          {/* Hub Colaborador */}
          <Route element={<HubLayout profile="colaborador" />}>
            <Route path="/hub/colaborador/inicio" element={<ColaboradorInicio />} />
            <Route path="/hub/colaborador/sobre-voce" element={<Stub title="Sobre você" subtitle="Perfil, histórico, PDI, avaliações" />} />
            <Route path="/hub/colaborador/solicitacoes" element={<Stub title="Minhas solicitações" />} />
            <Route path="/hub/colaborador/holerites" element={<Stub title="Holerites" />} />
            <Route path="/hub/colaborador/ferias" element={<Stub title="Férias" />} />
            <Route path="/hub/colaborador/beneficios" element={<Stub title="Benefícios" />} />
            <Route path="/hub/colaborador/politicas" element={<Stub title="Políticas internas" />} />
            <Route path="/hub/colaborador/treinamentos" element={<Stub title="Treinamentos" />} />
            <Route path="/hub/colaborador/ajuda" element={<Stub title="Ajuda / Denúncia" subtitle="Canal seguro de apoio" />} />
          </Route>

          {/* Hub CEO */}
          <Route element={<HubLayout profile="ceo" />}>
            <Route path="/hub/ceo/dashboard" element={<CeoDashboard />} />
            <Route path="/hub/ceo/headcount" element={<Stub title="Headcount por departamento" />} />
            <Route path="/hub/ceo/financeiro" element={<Stub title="Financeiro de RH" subtitle="Folha, benefícios, ROI, budget" />} />
            <Route path="/hub/ceo/avaliacoes" element={<Stub title="Avaliação de desempenho" />} />
            <Route path="/hub/ceo/turnover" element={<Stub title="Turnover e retenção" />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
