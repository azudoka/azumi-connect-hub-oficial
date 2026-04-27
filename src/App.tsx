import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import type { ReactElement } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider, useAuth, type Papel } from "@/context/AuthContext";

import { AppLayout } from "@/components/layout/AppLayout";
import { HubLayout } from "@/components/layout/HubLayout";
import PortalLayout from "@/layouts/PortalLayout";

import PortalDashboard from "./pages/portal/PortalDashboard";
// PortalProjetos, PortalProjetoDetalhe e PortalFinanceiro foram descontinuados
// como rotas — os arquivos permanecem no disco. As rotas /portal/* equivalentes
// agora redirecionam para /cliente/* (caminho canônico do cliente).

import Login from "./pages/Login";
import SelecaoPerfil from "./pages/auth/SelecaoPerfil";
import NotFound from "./pages/NotFound";
import Stub from "./pages/Stub";

import AdminDashboard from "./pages/admin/DashboardPage";
import Empresas from "./pages/admin/Empresas";
import AtracaoRouter from "./pages/AtracaoRouter";
import VagaDetalheAdmin from "./pages/admin/VagaDetalhe";
import Analytics from "./pages/admin/Analytics";
import GestaoConta from "./pages/admin/GestaoConta";
import HorasPage from "./pages/admin/HorasPage";
import ProjetosPage from "./pages/admin/ProjetosPage";
import ProjetoDetalhe from "./pages/admin/ProjetoDetalhe";
import FinanceiroPage from "./pages/admin/FinanceiroPage";
import ClientesPage from "./pages/admin/ClientesPage";
import ConfiguracoesPage from "./pages/admin/ConfiguracoesPage";
import SolicitacoesPage from "./pages/admin/SolicitacoesPage";
import VagasClientePage from "./pages/VagasClientePage";
import PerfilPage from "./pages/PerfilPage";
import SolicitacoesClientePage from "./pages/SolicitacoesClientePage";
import ClienteProjetosPage from "./pages/cliente/ClienteProjetosPage";
import ClienteProjetoDetalhe from "./pages/cliente/ClienteProjetoDetalhe";
import ClienteHorasPage from "./pages/cliente/ClienteHorasPage";

import ClienteDashboard from "./pages/cliente/ClienteDashboard";
import VagaDetalheCliente from "./pages/cliente/VagaDetalheCliente";

import LiderPainel from "./pages/hub/LiderPainel";
import LiderMeuTime from "./pages/hub/LiderMeuTime";
import LiderOnboarding from "./pages/hub/LiderOnboarding";
import LiderFeedback from "./pages/hub/LiderFeedback";
import LiderSolicitacoes from "./pages/hub/LiderSolicitacoes";
import ColaboradorInicio from "./pages/hub/ColaboradorInicio";
import ColaboradorSobreVoce from "./pages/hub/ColaboradorSobreVoce";
import ColaboradorHolerites from "./pages/hub/ColaboradorHolerites";
import ColaboradorFerias from "./pages/hub/ColaboradorFerias";
import ColaboradorBeneficios from "./pages/hub/ColaboradorBeneficios";
import ColaboradorSolicitacoes from "./pages/hub/ColaboradorSolicitacoes";
import CeoDashboard from "./pages/hub/CeoDashboard";

const queryClient = new QueryClient();

function PrivateRoute({
  allowed,
  children,
}: {
  allowed: Papel[];
  children: ReactElement;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.papel)) {
    const home = user.papel === "cliente" ? "/portal" : "/app/dashboard";
    return <Navigate to={home} replace />;
  }
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const destino =
    user.papel === "admin" || user.papel === "consultor"
      ? "/app/dashboard"
      : "/portal";
  return <Navigate to={destino} replace />;
}

// Redireciona /portal/projetos/:id → /cliente/projetos/:id preservando o id
function PortalProjetoRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/cliente/projetos/${id ?? ""}`} replace />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route path="/login" element={<Login />} />
    <Route path="/selecao-perfil" element={<SelecaoPerfil />} />

    {/* Admin / Consultor */}
    <Route
      element={
        <PrivateRoute allowed={["admin", "consultor"]}>
          <AppLayout />
        </PrivateRoute>
      }
    >
      <Route path="/app/dashboard" element={<AdminDashboard />} />
      <Route path="/app/empresas" element={<Empresas />} />
      <Route path="/app/empresas/:id" element={<Stub title="Detalhe da empresa" subtitle="Visão geral, vagas, projetos, horas, boletos, contratos, usuários" />} />
      <Route path="/app/usuarios" element={<Stub title="Usuários" subtitle="Gestão de usuários internos e externos" />} />
      <Route path="/app/projetos" element={<ProjetosPage />} />
      <Route path="/app/projetos/:id" element={<ProjetoDetalhe />} />
      <Route path="/app/clientes" element={<ClientesPage />} />
      <Route path="/app/clientes/:id" element={<Stub title="Detalhe do cliente" subtitle="Visão consolidada da empresa" />} />
      <Route path="/app/horas" element={<HorasPage />} />
      <Route path="/app/financeiro" element={<FinanceiroPage />} />
      <Route path="/app/solicitacoes" element={<SolicitacoesPage />} />
      <Route path="/app/solicitacoes/:id" element={<Stub title="Detalhe da solicitação" />} />
      <Route path="/app/atracao" element={<AtracaoRouter />} />
      <Route path="/app/atracao/:id" element={<VagaDetalheAdmin />} />
      <Route path="/app/candidatos/:id" element={<Stub title="Perfil do candidato" subtitle="DISC, questionários, pareceres" />} />
      <Route path="/app/analytics" element={<Analytics />} />
      <Route path="/app/gestao-de-conta" element={<GestaoConta />} />
      <Route path="/app/comunicados" element={<Stub title="Comunicados" subtitle="Criar, segmentar e rastrear leitura" />} />
      <Route path="/app/calendario" element={<Stub title="Calendário" />} />
      <Route path="/app/documentos" element={<Stub title="Documentos" subtitle="Biblioteca de documentos" />} />
      <Route path="/app/auditoria" element={<Stub title="Auditoria" subtitle="Log completo de ações" />} />
      <Route path="/app/configuracoes" element={<ConfiguracoesPage />} />
      <Route path="/app/perfil" element={<PerfilPage />} />
    </Route>

    {/* Cliente ADM (mantido) */}
    <Route
      element={
        <PrivateRoute allowed={["cliente"]}>
          <AppLayout />
        </PrivateRoute>
      }
    >
      <Route path="/cliente/dashboard" element={<ClienteDashboard />} />
      <Route path="/cliente/projetos" element={<ClienteProjetosPage />} />
      <Route path="/cliente/projetos/:id" element={<ClienteProjetoDetalhe />} />
      <Route path="/cliente/horas" element={<ClienteHorasPage />} />
      <Route path="/cliente/solicitacoes" element={<SolicitacoesClientePage />} />
      <Route path="/cliente/solicitacoes/:id" element={<Stub title="Detalhe da solicitação" subtitle="Conversa completa com a consultora" />} />
      <Route path="/cliente/atracao" element={<VagasClientePage />} />
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
      <Route path="/hub/lider/meu-time" element={<LiderMeuTime />} />
      <Route path="/hub/lider/meu-time/:id" element={<Stub title="Perfil do colaborador" />} />
      <Route path="/hub/lider/onboarding" element={<LiderOnboarding />} />
      <Route path="/hub/lider/feedback" element={<LiderFeedback />} />
      <Route path="/hub/lider/avaliacoes" element={<Stub title="Avaliação de desempenho" />} />
      <Route path="/hub/lider/solicitacoes" element={<LiderSolicitacoes />} />
      <Route path="/hub/lider/politicas" element={<Stub title="Políticas internas" />} />
      <Route path="/hub/lider/treinamentos" element={<Stub title="Treinamentos" />} />
      <Route path="/hub/lider/calendario" element={<Stub title="Calendário da equipe" />} />
      <Route path="/hub/lider/comunicados" element={<Stub title="Comunicados para a equipe" />} />
    </Route>

    {/* Hub Colaborador */}
    <Route element={<HubLayout profile="colaborador" />}>
      <Route path="/hub/colaborador/inicio" element={<ColaboradorInicio />} />
      <Route path="/hub/colaborador/sobre-voce" element={<ColaboradorSobreVoce />} />
      <Route path="/hub/colaborador/solicitacoes" element={<ColaboradorSolicitacoes />} />
      <Route path="/hub/colaborador/holerites" element={<ColaboradorHolerites />} />
      <Route path="/hub/colaborador/ferias" element={<ColaboradorFerias />} />
      <Route path="/hub/colaborador/beneficios" element={<ColaboradorBeneficios />} />
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

    {/* Portal do Cliente */}
    <Route
      element={
        <PrivateRoute allowed={["cliente", "admin"]}>
          <PortalLayout />
        </PrivateRoute>
      }
    >
      <Route path="/portal" element={<PortalDashboard />} />
      <Route path="/portal/projetos" element={<Navigate to="/cliente/projetos" replace />} />
      <Route path="/portal/projetos/:id" element={<PortalProjetoRedirect />} />
      <Route path="/portal/financeiro" element={<Navigate to="/cliente/gestao-conta" replace />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
